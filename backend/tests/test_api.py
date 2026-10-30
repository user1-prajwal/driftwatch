"""API tests: public scan routes, input validation and auth enforcement."""
import io

import pandas as pd
import pytest

PROTECTED = [
    ("get", "/monitors"),
    ("get", "/monitors/abc"),
    ("get", "/monitors/abc/history"),
    ("post", "/monitors/abc/pause"),
    ("post", "/monitors/abc/resume"),
    ("post", "/monitors/abc/run"),
    ("delete", "/monitors/abc"),
]


def csv_bytes(df):
    return io.BytesIO(df.to_csv(index=False).encode())


def spike_df():
    return pd.DataFrame({
        "date": pd.date_range("2026-01-01", periods=9).astype(str),
        "sales": [100, 102, 98, 101, 99, 103, 100, 101, 900],
    })


# ------------------------------------------------------------------- health
def test_health_is_public(anon_client):
    r = anon_client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# --------------------------------------------------------------------- auth
@pytest.mark.parametrize("method,path", PROTECTED)
def test_protected_routes_reject_requests_without_a_token(anon_client, method, path):
    r = getattr(anon_client, method)(path)
    assert r.status_code in (401, 403)   # HTTPBearer returns 403/401 when the header is missing


def test_create_monitor_requires_a_token(anon_client):
    r = anon_client.post("/monitors", data={
        "name": "x", "source_type": "google_sheet", "source_value": "u",
        "date_column": "date", "context": "c", "alert_email": "a@b.com", "interval_hours": 1})
    assert r.status_code in (401, 403)


def test_invalid_token_returns_401(anon_client, monkeypatch):
    import auth
    from types import SimpleNamespace

    def reject(token):
        raise RuntimeError("bad jwt")

    # replace the whole `auth` object so the test never depends on MagicMock internals
    monkeypatch.setattr(auth.supabase_anon, "auth", SimpleNamespace(get_user=reject))
    r = anon_client.get("/monitors", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401


def test_valid_token_resolves_to_the_user(anon_client, monkeypatch):
    from types import SimpleNamespace
    import auth, main
    monkeypatch.setattr(auth.supabase_anon, "auth", SimpleNamespace(
        get_user=lambda token: SimpleNamespace(user=SimpleNamespace(id="u1", email="e"))))
    monkeypatch.setattr(main, "get_all_monitors", lambda user_id: [{"id": "m1", "user_id": user_id}])
    r = anon_client.get("/monitors", headers={"Authorization": "Bearer good"})
    assert r.status_code == 200
    assert r.json()["monitors"][0]["user_id"] == "u1"


# --------------------------------------------- user_id comes from the token only
def test_create_monitor_uses_token_user_id_and_ignores_body(client, monkeypatch, user_a):
    import main
    captured = {}

    def fake_create(**kwargs):
        captured.update(kwargs)
        return {"id": "m1", "name": kwargs["name"], "interval_hours": kwargs["interval_hours"]}

    monkeypatch.setattr(main, "create_monitor", fake_create)
    monkeypatch.setattr(main, "add_monitor_to_scheduler", lambda m: None)
    r = client.post("/monitors", data={
        "name": "Daily", "source_type": "google_sheet", "source_value": "https://x",
        "date_column": "date", "context": "c", "alert_email": "a@b.com",
        "interval_hours": 6, "user_id": "attacker-id"})
    assert r.status_code == 200
    assert captured["user_id"] == user_a.id
    assert captured["user_id"] != "attacker-id"


def test_cannot_read_another_users_monitor(client, monkeypatch):
    import main
    monkeypatch.setattr(main, "get_monitor", lambda monitor_id, user_id: None)
    assert client.get("/monitors/someone-elses").status_code == 404


def test_cannot_delete_another_users_monitor(client, monkeypatch):
    import main
    monkeypatch.setattr(main, "remove_monitor_from_scheduler", lambda m: None)
    monkeypatch.setattr(main, "delete_monitor", lambda monitor_id, user_id: False)
    assert client.delete("/monitors/someone-elses").status_code == 404


def test_monitor_queries_are_scoped_by_user_id(monkeypatch):
    """Data-layer check: every user-facing query must add .eq('user_id', ...)."""
    from unittest.mock import MagicMock
    import monitors

    table = MagicMock()
    chain = table.select.return_value.eq.return_value
    chain.eq.return_value.execute.return_value.data = []
    monkeypatch.setattr(monitors, "supabase_admin", MagicMock(table=MagicMock(return_value=table)))

    monitors.get_monitor("m1", "u1")
    eq_calls = [c.args for c in table.select.return_value.eq.call_args_list] + \
               [c.args for c in chain.eq.call_args_list]
    assert ("user_id", "u1") in eq_calls


# -------------------------------------------------------------- input validation
def test_create_monitor_rejects_bad_sensitivity(client):
    r = client.post("/monitors", data={
        "name": "x", "source_type": "google_sheet", "source_value": "u", "date_column": "date",
        "context": "c", "alert_email": "a@b.com", "interval_hours": 1, "sensitivity": "extreme"})
    assert r.status_code == 400


def test_create_monitor_rejects_zero_interval(client):
    r = client.post("/monitors", data={
        "name": "x", "source_type": "google_sheet", "source_value": "u", "date_column": "date",
        "context": "c", "alert_email": "a@b.com", "interval_hours": 0})
    assert r.status_code == 400


# ------------------------------------------------------------------- /scan
def test_scan_rejects_non_csv(anon_client):
    r = anon_client.post("/scan", files={"file": ("data.txt", io.BytesIO(b"x"))},
                         data={"date_column": "date", "context": "c"})
    assert r.status_code == 400


def test_scan_rejects_bad_sensitivity(anon_client):
    r = anon_client.post("/scan", files={"file": ("d.csv", csv_bytes(spike_df()))},
                         data={"date_column": "date", "context": "c", "sensitivity": "ultra"})
    assert r.status_code == 400


def test_scan_returns_critical_for_a_spike(anon_client, no_gemini):
    r = anon_client.post("/scan", files={"file": ("d.csv", csv_bytes(spike_df()))},
                         data={"date_column": "date", "context": "daily sales"})
    assert r.status_code == 200
    body = r.json()
    assert body["summary"]["overall_status"] == "CRITICAL"
    assert body["summary"]["critical"] >= 1


def test_scan_is_stateless_and_deletes_the_temp_file(anon_client, no_gemini, workdir):
    anon_client.post("/scan", files={"file": ("d.csv", csv_bytes(spike_df()))},
                     data={"date_column": "date", "context": "c"})
    assert list((workdir / "data").iterdir()) == []


def test_scan_cleans_up_temp_file_even_when_it_fails(anon_client, workdir):
    r = anon_client.post("/scan", files={"file": ("d.csv", io.BytesIO(b"a,b\n1,2\n"))},
                         data={"date_column": "missing_col", "context": "c"})
    assert r.status_code in (200, 500)
    assert list((workdir / "data").iterdir()) == []


def test_scan_response_is_valid_json_when_a_column_is_degenerate(anon_client, no_gemini):
    """A one-row-history file must not make the response contain NaN."""
    df = pd.DataFrame({"date": ["2026-01-01", "2026-01-02"], "sales": [100, 500]})
    r = anon_client.post("/scan", files={"file": ("d.csv", csv_bytes(df))},
                         data={"date_column": "date", "context": "c"})
    assert r.status_code == 200
    assert "NaN" not in r.text


def test_columns_endpoint_lists_headers_and_row_count(anon_client):
    r = anon_client.post("/columns", files={"file": ("d.csv", csv_bytes(spike_df()))})
    assert r.status_code == 200
    assert r.json()["columns"] == ["date", "sales"]
    assert r.json()["rows"] == 9


def test_columns_endpoint_rejects_non_csv(anon_client):
    r = anon_client.post("/columns", files={"file": ("d.xlsx", io.BytesIO(b"x"))})
    assert r.status_code == 400
