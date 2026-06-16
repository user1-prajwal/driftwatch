import os
import json
import requests
import uuid
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from detector import run_driftwatch
from alerts import send_email_alert
from monitors import (
    get_all_active_monitors,
    get_monitor_by_id,
    update_after_run
)
from supabase_client import supabase_admin

scheduler = BackgroundScheduler()


# SAVE scan result to Supabase

def save_scan_history(monitor, results, overall_status, alert_sent):
    """
    Saves every scan result to scan_history table.
    This enables the run history graph and details view.
    """
    try:
        critical = [r for r in results if "CRITICAL" in r["status"]]
        warnings = [r for r in results if "WARNING"  in r["status"]]
        normal   = [r for r in results if "NORMAL"   in r["status"]]

        # Store only essential column data — not full Gemini text
        # to keep storage lean
        column_summary = []
        for r in results:
            col_data = {
                "column":      r["column"],
                "type":        r["type"],
                "status":      r["status"],
                "severity":    r.get("severity", 0),
                "change_text": r.get("change_text", ""),
            }
            # Add type-specific data
            if r["type"] == "numeric":
                col_data["today_value"]   = r.get("today_value")
                col_data["baseline_mean"] = r.get("baseline_mean")
            elif r["type"] == "categorical":
                col_data["today_pct"]    = r.get("today_pct", {})
                col_data["baseline_pct"] = r.get("baseline_pct", {})

            # Include AI explanation
            col_data["gemini_explanation"] = r.get("gemini_explanation")
            column_summary.append(col_data)

        data = {
            "monitor_id":     monitor["id"],
            "user_id":        monitor["user_id"],
            "overall_status": overall_status,
            "total_columns":  len(results),
            "critical_count": len(critical),
            "warning_count":  len(warnings),
            "normal_count":   len(normal),
            "column_results": json.dumps(column_summary),
            "alert_sent":     alert_sent,
        }

        supabase_admin.table("scan_history").insert(data).execute()
        print(f"💾 Scan history saved for '{monitor['name']}'")

    except Exception as e:
        print(f"⚠️  Could not save scan history: {e}")


# FETCH DATA from source

def fetch_data(source_type, source_value):
    if source_type == "google_sheet":
        if "/edit" in source_value:
            csv_url = source_value.replace("/edit", "/export?format=csv")
        elif "output=csv" in source_value or "format=csv" in source_value:
             csv_url = source_value 
        elif "export?format=csv" in source_value:
            csv_url = source_value
        else:
            csv_url = source_value + "/export?format=csv"

        print(f"📥 Fetching Google Sheet...")
        response = requests.get(csv_url, timeout=30)

        if response.status_code != 200:
            raise Exception(f"Could not fetch Google Sheet. Status: {response.status_code}")

        temp_path = f"data/temp_monitor_{uuid.uuid4().hex[:8]}.csv"
        with open(temp_path, "wb") as f:
            f.write(response.content)
        return temp_path

    elif source_type == "csv_path":
        if not os.path.exists(source_value):
            raise Exception(f"CSV file not found: {source_value}")
        return source_value

    else:
        raise Exception(f"Unknown source type: {source_type}")


# RUN ONE MONITOR

def run_monitor(monitor_id):
    monitor = get_monitor_by_id(monitor_id)

    if not monitor:
        print(f"⚠️  Monitor {monitor_id} not found.")
        return

    if monitor["status"] != "active":
        print(f"⏸️  Monitor '{monitor['name']}' is paused.")
        return

    print(f"\n{'='*55}")
    print(f"⏰ Auto-scan: '{monitor['name']}'")
    print(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*55}\n")

    temp_path = None
    try:
        temp_path = fetch_data(monitor["source_type"], monitor["source_value"])

        # Parse selected columns
        selected = [
            c.strip() for c in
            monitor.get("monitor_columns", "").split(",")
            if c.strip()
        ]

        results = run_driftwatch(
            filepath        = temp_path,
            date_column     = monitor["date_column"],
            context         = monitor["context"],
            sensitivity     = monitor["sensitivity"],
            monitor_columns = selected if selected else None,
        )

        critical = [r for r in results if "CRITICAL" in r["status"]]
        warnings = [r for r in results if "WARNING"  in r["status"]]

        overall = (
            "CRITICAL" if critical else
            "WARNING"  if warnings else
            "NORMAL"
        )

        # Build scan result for email
        scan_result = {
            "scan_id":     uuid.uuid4().hex[:8],
            "filename":    monitor["source_value"],
            "context":     monitor["context"],
            "sensitivity": monitor["sensitivity"],
            "scanned_at":  datetime.now().isoformat(),
            "summary": {
                "total_columns":  len(results),
                "critical":       len(critical),
                "warnings":       len(warnings),
                "normal":         len([r for r in results if "NORMAL" in r["status"]]),
                "overall_status": overall,
            },
            "columns": results,
        }

        # Send email alert if anomaly found
        alert_sent = False
        if overall != "NORMAL" and monitor["alert_email"]:
            email_result = send_email_alert(monitor["alert_email"], scan_result)
            alert_sent   = email_result.get("sent", False)
            if alert_sent:
                print(f"📧 Alert sent to {monitor['alert_email']}")

        # Save to scan history — always, not just on anomaly
        save_scan_history(monitor, results, overall, alert_sent)

        # Update monitor stats
        update_after_run(monitor_id, overall, alert_sent)

        print(f"✅ Scan complete: '{monitor['name']}' → {overall}")

    except Exception as e:
        print(f"❌ Monitor '{monitor['name']}' failed: {e}")
        update_after_run(monitor_id, "ERROR")

    finally:
        if temp_path and monitor.get("source_type") == "google_sheet":
            if os.path.exists(temp_path):
                os.remove(temp_path)


# SCHEDULER MANAGEMENT

def add_monitor_to_scheduler(monitor):
    job_id = f"monitor_{monitor['id']}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
    scheduler.add_job(
        func             = run_monitor,
        trigger          = IntervalTrigger(hours=monitor["interval_hours"]),
        args             = [monitor["id"]],
        id               = job_id,
        name             = monitor["name"],
        replace_existing = True,
    )
    print(f"⏰ Scheduled: '{monitor['name']}' every {monitor['interval_hours']} hour(s)")


def remove_monitor_from_scheduler(monitor_id):
    job_id = f"monitor_{monitor_id}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)


def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        print("⏰ DriftWatch scheduler started\n")

    monitors = get_all_active_monitors()
    if monitors:
        print(f"📋 Loading {len(monitors)} active monitor(s)...")
        for monitor in monitors:
            add_monitor_to_scheduler(monitor)
    else:
        print("📋 No active monitors yet.")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("⏰ Scheduler stopped.")