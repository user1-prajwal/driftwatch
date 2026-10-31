import os
import uuid
import shutil
from datetime import datetime

import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from detector import run_driftwatch
from alerts import send_email_alert
from auth import get_current_user
from monitors import (
    create_monitor, get_all_monitors,
    get_monitor, 
    delete_monitor,
    pause_monitor, resume_monitor
)
from scheduler import (
    start_scheduler, stop_scheduler,
    add_monitor_to_scheduler,
    remove_monitor_from_scheduler
)

# ── Abuse protection for the PUBLIC endpoints ─────────────────────
# /scan and /columns need no login and /scan calls Gemini, so they are the
# endpoints an anonymous visitor could use to burn quota or exhaust memory.
MAX_UPLOAD_MB    = int(os.getenv("MAX_UPLOAD_MB", "50"))
RATE_LIMIT_SCAN  = os.getenv("RATE_LIMIT_SCAN", "10/minute")
RATE_LIMIT_COLS  = os.getenv("RATE_LIMIT_COLUMNS", "30/minute")


def client_ip(request: Request) -> str:
    """Render sits behind a proxy, so the real client is in X-Forwarded-For."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=client_ip)


def save_upload(file: UploadFile, prefix: str) -> str:
    """
    Stream an upload to data/ under a server-generated name and enforce a size
    cap. The client's filename is NEVER used in the path (it could contain
    '../' and write outside data/).
    """
    path  = f"data/{prefix}_{uuid.uuid4().hex}.csv"
    limit = MAX_UPLOAD_MB * 1024 * 1024
    size  = 0
    try:
        with open(path, "wb") as buffer:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > limit:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum size is {MAX_UPLOAD_MB} MB.",
                    )
                buffer.write(chunk)
    except Exception:
        if os.path.exists(path):
            os.remove(path)
        raise
    return path


# Create FastAPI app

app = FastAPI(
    title="DriftWatch API",
    description="AI-powered data quality monitor",
    version="3.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
@limiter.limit(RATE_LIMIT_SCAN)
async def scan_file(
    request:     Request,
    file:        UploadFile = File(...),
    date_column: str        = Form(...),
    context:     str        = Form(...),
    sensitivity: str        = Form("medium"),
    monitor_columns:  str        = Form(""),
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
 
    temp_path = save_upload(file, "temp")
 
    try:
        # Parse comma-separated column names
        selected = [c.strip() for c in monitor_columns.split(",") if c.strip()]

        results = run_driftwatch(
            filepath        = temp_path,
            date_column     = date_column,
            context         = context,
            sensitivity     = sensitivity,
            monitor_columns = selected if selected else None,
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


# ROUTE 3 — List columns in a CSV

@app.post("/columns")
@limiter.limit(RATE_LIMIT_COLS)
async def get_columns(request: Request, file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files supported.")

    temp_path = save_upload(file, "temp_cols")

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
            
                           
# ROUTE 4 — Create monitor (AUTH REQUIRED)

@app.post("/monitors")
async def create_new_monitor(
    name:           str = Form(...),
    source_type:    str = Form(...),
    source_value:   str = Form(...),
    date_column:    str = Form(...),
    context:        str = Form(...),
    sensitivity:    str = Form("medium"),
    alert_email:    str = Form(...),
    interval_hours: int = Form(...),
    user = Depends(get_current_user),   # ← AUTH CHECK
    monitor_columns: str = Form("")   # ← ADD THIS
):
    """
    Protected endpoint.
    user_id taken from JWT token — never from request body.
    User cannot create monitors for other users.
    """
 
    if sensitivity not in ["low", "medium", "high"]:
        raise HTTPException(status_code=400, detail="sensitivity must be low/medium/high")
 
    if interval_hours < 1:
        raise HTTPException(status_code=400, detail="interval_hours must be at least 1")
 
    monitor = create_monitor(
        user_id        = user.id,   # from JWT, not from user input
        name           = name,
        source_type    = source_type,
        source_value   = source_value,
        date_column    = date_column,
        context        = context,
        sensitivity    = sensitivity,
        alert_email    = alert_email,
        interval_hours = interval_hours,
    )
 
    add_monitor_to_scheduler(monitor)
 
    return {
        "message": f"Monitor '{name}' created and scheduled.",
        "monitor": monitor,
    }
 
 
# ROUTE 5 — Get all monitors
@app.get("/monitors")
def list_monitors(user = Depends(get_current_user)):
    monitors = get_all_monitors(user_id=user.id)
    return {
        "total":    len(monitors),
        "monitors": monitors,
    }

 
# ROUTE 6 — Get one monitor
@app.get("/monitors/{monitor_id}")
def get_one_monitor(
    monitor_id: str,
    user = Depends(get_current_user)
):
    monitor = get_monitor(monitor_id, user_id=user.id)
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found.")
    return monitor
 
 
# ROUTE 9 — Pause a monitor
@app.post("/monitors/{monitor_id}/pause")
def pause(monitor_id: str, user = Depends(get_current_user)):
    if not pause_monitor(monitor_id, user_id=user.id):
        raise HTTPException(status_code=404, detail="Monitor not found.")
    remove_monitor_from_scheduler(monitor_id)
    return {"message": f"Monitor {monitor_id} paused."}
 
# ROUTE 10 — Resume a monitor
 
@app.post("/monitors/{monitor_id}/resume")
def resume(monitor_id: str, user = Depends(get_current_user)):
    if not resume_monitor(monitor_id, user_id=user.id):
        raise HTTPException(status_code=404, detail="Monitor not found.")
    monitor = get_monitor(monitor_id, user_id=user.id)
    add_monitor_to_scheduler(monitor)
    return {"message": f"Monitor {monitor_id} resumed."}
 
# ROUTE 11 — Delete a monitor
@app.delete("/monitors/{monitor_id}")
def delete(monitor_id: str, user = Depends(get_current_user)):
    remove_monitor_from_scheduler(monitor_id)
    if not delete_monitor(monitor_id, user_id=user.id):
        raise HTTPException(status_code=404, detail="Monitor not found.")
    return {"message": f"Monitor {monitor_id} deleted."}


# ROUTE 12 — Manually trigger a monitor NOW
@app.post("/monitors/{monitor_id}/run")
def run_now(monitor_id: str, user = Depends(get_current_user)):
    monitor = get_monitor(monitor_id, user_id=user.id)
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found.")
 
    from scheduler import run_monitor
    import threading
    thread = threading.Thread(target=run_monitor, args=[monitor_id])
    thread.start()
 
    return {
        "message":    f"Monitor '{monitor['name']}' triggered manually.",
        "monitor_id": monitor_id
    }
    

# Get scan history for a specific monitor
@app.get("/monitors/{monitor_id}/history")
def get_monitor_history(
    monitor_id: str,
    limit: int = 10,
    user = Depends(get_current_user)
):
    """
    Returns last N scan results for a monitor.
    Used by the frontend to show run history graph
    and detailed results.
    """
    import json
    from supabase_client import supabase_admin

    # First verify this monitor belongs to this user
    from monitors import get_monitor
    monitor = get_monitor(monitor_id, user_id=user.id)
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found.")

    # Get scan history — most recent first
    response = (
        supabase_admin
        .table("scan_history")
        .select("*")
        .eq("monitor_id", monitor_id)
        .order("scanned_at", desc=True)
        .limit(limit)
        .execute()
    )

    history = response.data or []

    # Parse column_results from JSON string back to list
    for item in history:
        if isinstance(item.get("column_results"), str):
            try:
                item["column_results"] = json.loads(item["column_results"])
            except:
                item["column_results"] = []

    return {
        "monitor_id": monitor_id,
        "total":      len(history),
        "history":    history,
    }