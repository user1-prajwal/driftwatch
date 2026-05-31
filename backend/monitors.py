import json
import uuid
import os
from datetime import datetime

MONITORS_FILE = "data/monitors.json"


def _load_all():
    """Read all monitors from JSON file."""
    if not os.path.exists(MONITORS_FILE):
        return {}
    with open(MONITORS_FILE, "r") as f:
        return json.load(f)


def _save_all(monitors):
    """Save all monitors to JSON file."""
    os.makedirs("data", exist_ok=True)
    with open(MONITORS_FILE, "w") as f:
        json.dump(monitors, f, indent=2)

 
# CREATE a new monitor
def create_monitor(
    name,               # "Daily Sales Check"
    source_type,        # "google_sheet" or "csv_path"
    source_value,       # sheet URL or file path
    date_column,        # which column has dates
    context,            # plain English description
    sensitivity,        # "low", "medium", "high"
    alert_email,        # where to send alerts
    interval_hours,     # check every X hours (user picks)
):
    """
    Creates a new monitor and saves it.
    Returns the monitor dict with its ID.
    """
 
    monitor_id = str(uuid.uuid4())[:8]
 
    monitor = {
        "id":             monitor_id,
        "name":           name,
        "source_type":    source_type,
        "source_value":   source_value,
        "date_column":    date_column,
        "context":        context,
        "sensitivity":    sensitivity,
        "alert_email":    alert_email,
        "interval_hours": interval_hours,
        "status":         "active",
        "created_at":     datetime.now().isoformat(),
        "last_run":       None,
        "last_status":    None,
        "total_runs":     0,
        "total_alerts":   0,
    }
 
    monitors = _load_all()
    monitors[monitor_id] = monitor
    _save_all(monitors)
 
    print(f"✅ Monitor created: '{name}' (ID: {monitor_id})")
    print(f"   Runs every {interval_hours} hour(s)")
    print(f"   Alerts go to: {alert_email}\n")
 
    return monitor
 