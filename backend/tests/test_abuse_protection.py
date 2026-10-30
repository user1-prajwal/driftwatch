"""Rate limiting, upload size cap and safe temp-file handling on the public endpoints."""
import io

import pandas as pd


def small_csv():
    df = pd.DataFrame({"date": ["2026-01-01", "2026-01-02"], "x": [1, 2]})
    return io.BytesIO(df.to_csv(index=False).encode())


# ------------------------------------------------------------- rate limiting
def test_columns_endpoint_is_rate_limited_per_ip(anon_client):
    codes = [anon_client.post("/columns", files={"file": ("d.csv", small_csv())}).status_code
             for _ in range(7)]
    assert codes[:5] == [200] * 5
    assert codes[5:] == [429, 429]


def test_scan_endpoint_is_rate_limited_per_ip(anon_client, no_gemini):
    codes = [anon_client.post("/scan", files={"file": ("d.csv", small_csv())},
                              data={"date_column": "date", "context": "c"}).status_code
             for _ in range(7)]
    assert 429 in codes
    assert codes.index(429) == 5          # the 6th request is the first one refused


def test_different_ips_have_independent_limits(anon_client):
    for _ in range(5):
        anon_client.post("/columns", files={"file": ("d.csv", small_csv())},
                         headers={"X-Forwarded-For": "1.1.1.1"})
    blocked = anon_client.post("/columns", files={"file": ("d.csv", small_csv())},
                               headers={"X-Forwarded-For": "1.1.1.1"})
    other = anon_client.post("/columns", files={"file": ("d.csv", small_csv())},
                             headers={"X-Forwarded-For": "2.2.2.2"})
    assert blocked.status_code == 429
    assert other.status_code == 200


def test_health_and_protected_routes_are_not_rate_limited(anon_client):
    assert all(anon_client.get("/health").status_code == 200 for _ in range(20))


# ---------------------------------------------------------------- size cap
def test_oversized_upload_is_rejected_with_413_and_leaves_no_file(anon_client, workdir):
    big = io.BytesIO(b"a,b\n" + b"1,2\n" * (600_000))          # ~2.4 MB, limit in tests is 1 MB
    r = anon_client.post("/scan", files={"file": ("big.csv", big)},
                         data={"date_column": "a", "context": "c"})
    assert r.status_code == 413
    assert list((workdir / "data").iterdir()) == []


def test_upload_under_the_limit_is_accepted(anon_client):
    assert anon_client.post("/columns", files={"file": ("d.csv", small_csv())}).status_code == 200


# --------------------------------------------------------- path traversal safety
def test_client_supplied_filename_cannot_escape_the_data_folder(anon_client, workdir):
    r = anon_client.post("/columns", files={"file": ("../../evil.csv", small_csv())})
    assert r.status_code == 200
    assert not (workdir / "evil.csv").exists()
    assert not (workdir.parent / "evil.csv").exists()
    assert list((workdir / "data").iterdir()) == []            # temp file was cleaned up


def test_two_uploads_with_the_same_filename_do_not_collide(anon_client, workdir, monkeypatch):
    """/columns used to write data/temp_cols_<filename>, so same-named uploads shared one path."""
    import main
    paths = []
    original = main.save_upload

    def spy(file, prefix):
        p = original(file, prefix)
        paths.append(p)
        return p

    monkeypatch.setattr(main, "save_upload", spy)
    anon_client.post("/columns", files={"file": ("same.csv", small_csv())})
    anon_client.post("/columns", files={"file": ("same.csv", small_csv())})
    assert len(set(paths)) == 2
