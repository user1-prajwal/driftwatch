import os
import uuid
import shutil
from datetime import datetime

import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from detector import run_driftwatch
from alerts import send_email_alert
from auth import get_current_user
from monitors import (
    create_monitor, get_all_monitors,
    get_monitor, delete_monitor,
    pause_monitor, resume_monitor
)
from scheduler import (
    start_scheduler, stop_scheduler,
    add_monitor_to_scheduler,
    remove_monitor_from_scheduler
)

# Create FastAPI app

app = FastAPI(
    title="DriftWatch API",
    description="AI-powered data quality monitor",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Start scheduler when app starts
# Stop scheduler when app shuts down
@app.on_event("startup")
def startup():
    start_scheduler()
 
 
@app.on_event("shutdown")
def shutdown():
    stop_scheduler()
 
# ROUTE 1 — Health check

@app.get("/health")
def health_check():
    return {
        "status":    "ok",
        "message":   "DriftWatch is running",
        "timestamp": datetime.now().isoformat()
    }
    

# ROUTE 2 — One-time scan (NO auth required)
# Completely stateless — results not saved
@app.post("/scan")
async def scan_file(
    file:        UploadFile = File(...),
    date_column: str        = Form(...),
    context:     str        = Form(...),
    sensitivity: str        = Form("medium"),
):
    """
    Public endpoint — no login required.
    Runs detectors and returns results.
    Nothing is saved to database.
    Results exist only in the API response.
    """
 
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
 
    if sensitivity not in ["low", "medium", "high"]:
        raise HTTPException(status_code=400, detail="sensitivity must be low/medium/high.")
 
    temp_path = f"data/temp_{uuid.uuid4().hex[:8]}_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
 
    try:
        results  = run_driftwatch(
            filepath    = temp_path,
            date_column = date_column,
            context     = context,
            sensitivity = sensitivity,
        )
 
        critical = [r for r in results if "CRITICAL" in r["status"]]
        warnings = [r for r in results if "WARNING"  in r["status"]]
        normal   = [r for r in results if "NORMAL"   in r["status"]]
 
        return {
            "scan_id":     uuid.uuid4().hex[:8],
            "filename":    file.filename,
            "context":     context,
            "sensitivity": sensitivity,
            "scanned_at":  datetime.now().isoformat(),
            "summary": {
                "total_columns":  len(results),
                "critical":       len(critical),
                "warnings":       len(warnings),
                "normal":         len(normal),
                "overall_status": (
                    "CRITICAL" if critical else
                    "WARNING"  if warnings else
                    "NORMAL"
                ),
            },
            "columns": results,
        }
 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ROUTE 4 — Get one specific scan result

@app.get("/results/{scan_id}")
def get_one_result(scan_id: str):
    if scan_id not in scan_results:
        raise HTTPException(status_code=404, detail=f"Scan '{scan_id}' not found.")
    return scan_results[scan_id]


# ROUTE 5 — List columns in a CSV

@app.post("/columns")
async def get_columns(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files supported.")

    temp_path = f"data/temp_cols_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = pd.read_csv(temp_path)
        return {
            "filename": file.filename,
            "columns":  list(df.columns),
            "rows":     len(df)
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
                           
# ROUTE 6 — Create a new monitor
# User sets: source, schedule, email, sensitivity
@app.post("/monitors")
def create_new_monitor(
    name:           str = Form(...),
    source_type:    str = Form(...),   # "google_sheet" or "csv_path"
    source_value:   str = Form(...),   # URL or file path
    date_column:    str = Form(...),
    context:        str = Form(...),
    sensitivity:    str = Form("medium"),
    alert_email:    str = Form(...),
    interval_hours: int = Form(...),   # user picks: 1, 6, 12, 24, etc.
):
    if sensitivity not in ["low", "medium", "high"]:
        raise HTTPException(status_code=400, detail="sensitivity must be low/medium/high")
 
    if interval_hours < 1:
        raise HTTPException(status_code=400, detail="interval_hours must be at least 1")
 
    # Save monitor to JSON
    monitor = create_monitor(
        name           = name,
        source_type    = source_type,
        source_value   = source_value,
        date_column    = date_column,
        context        = context,
        sensitivity    = sensitivity,
        alert_email    = alert_email,
        interval_hours = interval_hours,
    )
 
    # Add to scheduler immediately
    add_monitor_to_scheduler(monitor)
 
    return {
        "message": f"Monitor '{name}' created and scheduled.",
        "monitor": monitor,
    }
 
 
# ROUTE 7 — Get all monitors
@app.get("/monitors")
def list_monitors():
    monitors = get_all_monitors()
    return {
        "total":    len(monitors),
        "monitors": monitors,
    }

 
# ROUTE 8 — Get one monitor
@app.get("/monitors/{monitor_id}")
def get_one_monitor(monitor_id: str):
    monitor = get_monitor(monitor_id)
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found.")
    return monitor
 
# ROUTE 9 — Pause a monitor
@app.post("/monitors/{monitor_id}/pause")
def pause(monitor_id: str):
    if not pause_monitor(monitor_id):
        raise HTTPException(status_code=404, detail="Monitor not found.")
    remove_monitor_from_scheduler(monitor_id)
    return {"message": f"Monitor {monitor_id} paused."}
 
# ROUTE 10 — Resume a monitor
 
@app.post("/monitors/{monitor_id}/resume")
def resume(monitor_id: str):
    if not resume_monitor(monitor_id):
        raise HTTPException(status_code=404, detail="Monitor not found.")
    monitor = get_monitor(monitor_id)
    add_monitor_to_scheduler(monitor)
    return {"message": f"Monitor {monitor_id} resumed."}
 
# ROUTE 11 — Delete a monitor
@app.delete("/monitors/{monitor_id}")
def delete(monitor_id: str):
    remove_monitor_from_scheduler(monitor_id)
    if not delete_monitor(monitor_id):
        raise HTTPException(status_code=404, detail="Monitor not found.")
    return {"message": f"Monitor {monitor_id} deleted."}


# ROUTE 12 — Manually trigger a monitor NOW
@app.post("/monitors/{monitor_id}/run")
def run_now(monitor_id: str):
    """
    Manually triggers a monitor scan immediately.
    Useful for testing without waiting for schedule.
    """
    monitor = get_monitor(monitor_id)
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found.")

    from scheduler import run_monitor
    import threading

    # Run in background thread so API responds immediately
    thread = threading.Thread(target=run_monitor, args=[monitor_id])
    thread.start()

    return {
        "message": f"Monitor '{monitor['name']}' triggered manually.",
        "monitor_id": monitor_id
    }