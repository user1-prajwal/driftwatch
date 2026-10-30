"""Alert policy and scheduler behaviour, with all external services mocked."""
from unittest.mock import MagicMock

import pytest


def scan_result(overall="CRITICAL", critical=1, warnings=0):
    return {
        "scan_id": "s1", "filename": "https://docs.google.com/spreadsheets/d/x/edit",
        "context": "sales", "sensitivity": "medium", "scanned_at": "2026-07-01T10:00:00",
        "summary": {"total_columns": 1, "critical": critical, "warnings": warnings,
                    "normal": 0, "overall_status": overall},
        "columns": [{"column": "sales", "type": "numeric", "status": "🔴 CRITICAL",
                     "severity": 99.0, "change_text": "📉 80% lower than usual",
                     "today_value": 10.0, "baseline_mean": 100.0,
                     "gemini_explanation": "WHAT HAPPENED:\nx"}],
    }


# ------------------------------------------------------------------- alerts
def test_no_email_is_sent_when_everything_is_normal(monkeypatch):
    import alerts
    post = MagicMock()
    monkeypatch.setattr(alerts.requests, "post", post)
    out = alerts.send_email_alert("a@b.com", scan_result("NORMAL", 0, 0))
    assert out["sent"] is False
    post.assert_not_called()


def test_email_is_sent_through_the_brevo_https_api_for_anomalies(monkeypatch):
    import alerts
    post = MagicMock(return_value=MagicMock(status_code=201, json=lambda: {}))
    monkeypatch.setattr(alerts.requests, "post", post)
    out = alerts.send_email_alert("a@b.com", scan_result())
    assert out["sent"] is True
    url = post.call_args.args[0] if post.call_args.args else post.call_args.kwargs["url"]
    assert url.startswith("https://api.brevo.com/")


def test_failed_email_returns_a_reason_instead_of_raising(monkeypatch):
    import alerts
    post = MagicMock(return_value=MagicMock(status_code=401, json=lambda: {"message": "Key not found"}))
    monkeypatch.setattr(alerts.requests, "post", post)
    out = alerts.send_email_alert("a@b.com", scan_result())
    assert out["sent"] is False


# ---------------------------------------------------------------- scheduler
def monitor(**over):
    base = {"id": "m1", "user_id": "u1", "name": "Daily", "status": "active",
            "source_type": "google_sheet", "source_value": "https://x/edit",
            "date_column": "date", "context": "c", "sensitivity": "medium",
            "alert_email": "a@b.com", "interval_hours": 6, "monitor_columns": ""}
    base.update(over)
    return base


def test_paused_monitor_does_not_run(monkeypatch):
    import scheduler
    fetch = MagicMock()
    monkeypatch.setattr(scheduler, "get_monitor_by_id", lambda i: monitor(status="paused"))
    monkeypatch.setattr(scheduler, "fetch_data", fetch)
    scheduler.run_monitor("m1")
    fetch.assert_not_called()


def test_deleted_monitor_is_skipped(monkeypatch):
    import scheduler
    fetch = MagicMock()
    monkeypatch.setattr(scheduler, "get_monitor_by_id", lambda i: None)
    monkeypatch.setattr(scheduler, "fetch_data", fetch)
    scheduler.run_monitor("gone")
    fetch.assert_not_called()


def test_anomaly_sends_alert_and_saves_history(monkeypatch):
    import scheduler
    result = [{"column": "sales", "type": "numeric", "status": "🔴 CRITICAL", "severity": 99.0}]
    send, save, update = MagicMock(return_value={"sent": True}), MagicMock(), MagicMock()
    monkeypatch.setattr(scheduler, "get_monitor_by_id", lambda i: monitor())
    monkeypatch.setattr(scheduler, "fetch_data", lambda *a: "data/none.csv")
    monkeypatch.setattr(scheduler, "run_driftwatch", lambda **kw: result)
    monkeypatch.setattr(scheduler, "send_email_alert", send)
    monkeypatch.setattr(scheduler, "save_scan_history", save)
    monkeypatch.setattr(scheduler, "update_after_run", update)
    scheduler.run_monitor("m1")
    send.assert_called_once()
    save.assert_called_once()
    assert update.call_args.args[:2] == ("m1", "CRITICAL")


def test_normal_scan_saves_history_but_sends_no_email(monkeypatch):
    import scheduler
    result = [{"column": "sales", "type": "numeric", "status": "🟢 NORMAL", "severity": 3.0}]
    send, save = MagicMock(), MagicMock()
    monkeypatch.setattr(scheduler, "get_monitor_by_id", lambda i: monitor())
    monkeypatch.setattr(scheduler, "fetch_data", lambda *a: "data/none.csv")
    monkeypatch.setattr(scheduler, "run_driftwatch", lambda **kw: result)
    monkeypatch.setattr(scheduler, "send_email_alert", send)
    monkeypatch.setattr(scheduler, "save_scan_history", save)
    monkeypatch.setattr(scheduler, "update_after_run", MagicMock())
    scheduler.run_monitor("m1")
    send.assert_not_called()
    save.assert_called_once()


def test_failed_scan_is_recorded_as_error_not_raised(monkeypatch):
    import scheduler
    update = MagicMock()
    monkeypatch.setattr(scheduler, "get_monitor_by_id", lambda i: monitor())
    monkeypatch.setattr(scheduler, "fetch_data", MagicMock(side_effect=Exception("sheet unreachable")))
    monkeypatch.setattr(scheduler, "update_after_run", update)
    scheduler.run_monitor("m1")          # must not raise
    update.assert_called_once_with("m1", "ERROR")


@pytest.mark.parametrize("url,expected", [
    ("https://docs.google.com/spreadsheets/d/ID/edit", "https://docs.google.com/spreadsheets/d/ID/export?format=csv"),
    ("https://docs.google.com/spreadsheets/d/ID/export?format=csv", "https://docs.google.com/spreadsheets/d/ID/export?format=csv"),
])
def test_google_sheet_urls_are_converted_to_csv_export_urls(monkeypatch, workdir, url, expected):
    import scheduler
    seen = {}

    def fake_get(u, timeout):
        seen["url"] = u
        return MagicMock(status_code=200, content=b"a,b\n1,2\n")

    monkeypatch.setattr(scheduler.requests, "get", fake_get)
    path = scheduler.fetch_data("google_sheet", url)
    assert seen["url"] == expected
    assert path.endswith(".csv")


def test_fetch_raises_on_unreachable_sheet(monkeypatch, workdir):
    import scheduler
    monkeypatch.setattr(scheduler.requests, "get", lambda u, timeout: MagicMock(status_code=403))
    with pytest.raises(Exception, match="403"):
        scheduler.fetch_data("google_sheet", "https://x/edit")


def test_startup_rebuilds_jobs_for_every_active_monitor_from_the_database(monkeypatch):
    """The restart-recovery claim: schedule state is derived from the DB on boot."""
    import scheduler
    active = [monitor(id="m1"), monitor(id="m2", interval_hours=24)]
    monkeypatch.setattr(scheduler, "get_all_active_monitors", lambda: active)
    sched = scheduler.BackgroundScheduler()
    monkeypatch.setattr(scheduler, "scheduler", sched)
    scheduler.start_scheduler()
    try:
        assert {j.id for j in sched.get_jobs()} == {"monitor_m1", "monitor_m2"}
    finally:
        sched.shutdown(wait=False)


def test_rescheduling_a_monitor_replaces_the_job_instead_of_duplicating(monkeypatch):
    import scheduler
    sched = scheduler.BackgroundScheduler()
    monkeypatch.setattr(scheduler, "scheduler", sched)
    sched.start()
    try:
        scheduler.add_monitor_to_scheduler(monitor(interval_hours=6))
        scheduler.add_monitor_to_scheduler(monitor(interval_hours=12))
        assert len(sched.get_jobs()) == 1
    finally:
        sched.shutdown(wait=False)


def test_removing_a_monitor_removes_its_job(monkeypatch):
    import scheduler
    sched = scheduler.BackgroundScheduler()
    monkeypatch.setattr(scheduler, "scheduler", sched)
    sched.start()
    try:
        scheduler.add_monitor_to_scheduler(monitor())
        scheduler.remove_monitor_from_scheduler("m1")
        assert sched.get_jobs() == []
    finally:
        sched.shutdown(wait=False)
