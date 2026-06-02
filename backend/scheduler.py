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

