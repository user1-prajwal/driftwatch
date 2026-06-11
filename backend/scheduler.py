import requests
import pandas as pd
import io
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from detector import run_driftwatch
from alerts import send_email_alert
from monitors import  get_monitor_by_id, get_monitor, update_after_run

# One global scheduler instance
# Starts when FastAPI starts
# Runs silently in the background

scheduler = BackgroundScheduler()


# FETCH DATA from the source
# Supports: Google Sheet URL or local CSV path

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
 
        import uuid
        temp_path = f"data/temp_monitor_{uuid.uuid4().hex[:8]}.csv"
        with open(temp_path, "wb") as f:
            f.write(response.content)
        return temp_path
 
    elif source_type == "csv_path":
        import os
        if not os.path.exists(source_value):
            raise Exception(f"CSV file not found: {source_value}")
        return source_value
 
    else:
        raise Exception(f"Unknown source type: {source_type}")


# RUN ONE MONITOR

def run_monitor(monitor_id):
    import os
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
 
        results = run_driftwatch(
            filepath    = temp_path,
            date_column = monitor["date_column"],
            context     = monitor["context"],
            sensitivity = monitor["sensitivity"],
        )
 
        import uuid
        critical = [r for r in results if "CRITICAL" in r["status"]]
        warnings = [r for r in results if "WARNING"  in r["status"]]
        normal   = [r for r in results if "NORMAL"   in r["status"]]
 
        overall = (
            "CRITICAL" if critical else
            "WARNING"  if warnings else
            "NORMAL"
        )
 
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
                "normal":         len(normal),
                "overall_status": overall,
            },
            "columns": results,
        }
 
        alert_sent = False
        if overall != "NORMAL" and monitor["alert_email"]:
            email_result = send_email_alert(monitor["alert_email"], scan_result)
            alert_sent   = email_result.get("sent", False)
            if alert_sent:
                print(f"📧 Alert sent to {monitor['alert_email']}")
 
        update_after_run(monitor_id, overall, alert_sent)
        print(f"✅ Scan complete: '{monitor['name']}' → {overall}")
 
    except Exception as e:
        print(f"❌ Monitor '{monitor['name']}' failed: {e}")
        update_after_run(monitor_id, "ERROR")
 
    finally:
        # Clean up temp file if it was a Google Sheet
        if temp_path and monitor.get("source_type") == "google_sheet":
            if os.path.exists(temp_path):
                os.remove(temp_path)
                

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