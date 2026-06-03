import requests
import pandas as pd
import io
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from detector import run_driftwatch
from alerts import send_email_alert
from monitors import get_all_monitors, get_monitor, update_after_run

# One global scheduler instance
# Starts when FastAPI starts
# Runs silently in the background

scheduler = BackgroundScheduler()


# FETCH DATA from the source
# Supports: Google Sheet URL or local CSV path

def fetch_data(source_type, source_value):
    """
    Fetches data from wherever the user pointed us.
    Returns a temp file path that detector can read.
    """

    if source_type == "google_sheet":
        # Convert Google Sheet URL to CSV export URL
        # User pastes: https://docs.google.com/spreadsheets/d/ID/edit
        # We convert to: https://docs.google.com/spreadsheets/d/ID/export?format=csv

        if "/edit" in source_value:
            csv_url = source_value.replace("/edit", "/export?format=csv")
        elif "export?format=csv" in source_value:
            csv_url = source_value
        else:
            csv_url = source_value + "/export?format=csv"

        print(f"📥 Fetching Google Sheet: {csv_url[:60]}...")
        response = requests.get(csv_url, timeout=30)

        if response.status_code != 200:
            raise Exception(f"Could not fetch Google Sheet. Status: {response.status_code}")

        # Save to temp file
        temp_path = f"data/temp_monitor_sheet.csv"
        with open(temp_path, "wb") as f:
            f.write(response.content)

        return temp_path

    elif source_type == "csv_path":
        # Local CSV file — just return the path
        if not __import__("os").path.exists(source_value):
            raise Exception(f"CSV file not found: {source_value}")
        return source_value

    else:
        raise Exception(f"Unknown source type: {source_type}")


# RUN ONE MONITOR
# This is what the scheduler calls automatically

def run_monitor(monitor_id):
    """
    Called automatically by the scheduler.
    Fetches data, runs all detectors, sends alert if needed.
    """

    monitor = get_monitor(monitor_id)

    if not monitor:
        print(f"⚠️  Monitor {monitor_id} not found. Skipping.")
        return

    if monitor["status"] != "active":
        print(f"⏸️  Monitor '{monitor['name']}' is paused. Skipping.")
        return

    print(f"\n{'='*55}")
    print(f"⏰ Auto-scan running: '{monitor['name']}'")
    print(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*55}\n")

    try:
        # 1. Fetch the data
        temp_path = fetch_data(monitor["source_type"], monitor["source_value"])

        # 2. Run all 3 detectors
        results = run_driftwatch(
            filepath    = temp_path,
            date_column = monitor["date_column"],
            context     = monitor["context"],
            sensitivity = monitor["sensitivity"],
        )

        # 3. Build scan result object (same format as /scan endpoint)
        from uuid import uuid4
        critical = [r for r in results if "CRITICAL" in r["status"]]
        warnings = [r for r in results if "WARNING"  in r["status"]]
        normal   = [r for r in results if "NORMAL"   in r["status"]]

        overall = (
            "CRITICAL" if critical else
            "WARNING"  if warnings else
            "NORMAL"
        )

        scan_result = {
            "scan_id":     str(uuid4())[:8],
            "filename":    monitor["source_value"],
            "context":     monitor["context"],
            "sensitivity": monitor["sensitivity"],
            "scanned_at":  datetime.now().isoformat(),
            "summary": {
                "total_columns":  len(results),
                "critical":       len(critical),
                "warnings":       len(warnings),
                "normal":         len(normal),
                "overall_status": overall,
            },
            "columns": results,
        }

        # 4. Send email alert if anomaly found
        alert_sent = False
        if overall != "NORMAL" and monitor["alert_email"]:
            email_result = send_email_alert(monitor["alert_email"], scan_result)
            alert_sent   = email_result.get("sent", False)
            if alert_sent:
                print(f"📧 Alert sent to {monitor['alert_email']}")

        # 5. Update monitor stats
        update_after_run(monitor_id, overall, alert_sent)

        print(f"\n✅ Auto-scan complete: '{monitor['name']}' → {overall}")
        if not alert_sent and overall != "NORMAL":
            print(f"   (anomaly found but no email configured)")

    except Exception as e:
        print(f"❌ Monitor '{monitor['name']}' failed: {e}")
        update_after_run(monitor_id, "ERROR")

# ADD a monitor to the scheduler
# Called when user creates a new monitor
def add_monitor_to_scheduler(monitor):
    job_id = f"monitor_{monitor['id']}"
 
    # Remove existing job if it exists (for updates)
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
 
    scheduler.add_job(
        func            = run_monitor,
        trigger         = IntervalTrigger(hours=monitor["interval_hours"]),
        args            = [monitor["id"]],
        id              = job_id,
        name            = monitor["name"],
        replace_existing= True,
    )
 
    print(f"⏰ Scheduled: '{monitor['name']}' every {monitor['interval_hours']} hour(s)")
    
def remove_monitor_from_scheduler(monitor_id):
    job_id = f"monitor_{monitor_id}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
        print(f"🗑️  Removed from scheduler: {monitor_id}")
        
        
# START the scheduler
# Called once when FastAPI starts
def start_scheduler():
    """
    Starts APScheduler and loads all existing monitors.
    Called automatically when FastAPI app starts.
    """
 
    if not scheduler.running:
        scheduler.start()
        print("⏰ DriftWatch scheduler started\n")
 
    # Load all existing active monitors from JSON
    monitors = get_all_monitors()
    active   = [m for m in monitors if m["status"] == "active"]
 
    if active:
        print(f"📋 Loading {len(active)} active monitor(s)...")
        for monitor in active:
            add_monitor_to_scheduler(monitor)
    else:
        print("📋 No active monitors yet. Create one from the dashboard.")
        
def stop_scheduler():
    """Called when FastAPI shuts down."""
    if scheduler.running:
        scheduler.shutdown()
        print("⏰ Scheduler stopped.")