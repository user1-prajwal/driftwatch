import os
import uuid
import json
import shutil
from datetime import datetime

import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from detector import run_driftwatch

# Create FastAPI app

app = FastAPI(
    title="DriftWatch API",
    description="AI-powered data quality monitor",
    version="1.0.0"
)

# CORS — allows React frontend to talk to this API
# (without this, browser will block the requests)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # in production, replace * with your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for scan results
# (we'll move this to a database later)

scan_results = {}   # { scan_id: result_data }


# ROUTE 1 — Health check
# Visit: http://localhost:8000/health

@app.get("/health")
def health_check():
    """
    Simple check to confirm API is running.
    React dashboard calls this on startup.
    """
    return {
        "status": "ok",
        "message": "DriftWatch is running",
        "timestamp": datetime.now().isoformat()
    }

 
# ROUTE 2 — Scan a CSV file
# POST: http://localhost:8000/scan
#
# Accepts:
#   - file       → the CSV file to scan
#   - date_column→ which column has the date
#   - context    → plain English description of data
 
@app.post("/scan")
async def scan_file(
    file: UploadFile = File(...),
    date_column: str = Form(...),
    context: str     = Form(...)
):
    """
    Main endpoint. Upload a CSV, get drift analysis back.
    """
 
    # 1. Validate file is a CSV
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported right now."
        )
 
    # 2. Save uploaded file temporarily
    temp_path = f"data/temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
 
    try:
        # 3. Run DriftWatch detector on the file
        results = run_driftwatch(
            filepath    = temp_path,
            date_column = date_column,
            context     = context
        )
 
        # 4. Build a clean response
        scan_id = str(uuid.uuid4())[:8]   # short unique ID like "a3f9b2c1"
 
        critical = [r for r in results if "CRITICAL" in r["status"]]
        warnings = [r for r in results if "WARNING"  in r["status"]]
        normal   = [r for r in results if "NORMAL"   in r["status"]]
 
        response = {
            "scan_id":    scan_id,
            "filename":   file.filename,
            "context":    context,
            "scanned_at": datetime.now().isoformat(),
            "summary": {
                "total_columns": len(results),
                "critical":      len(critical),
                "warnings":      len(warnings),
                "normal":        len(normal),
                "overall_status": (
                    "CRITICAL" if critical else
                    "WARNING"  if warnings else
                    "NORMAL"
                )
            },
            "columns": results   # full per-column results
        }
 
        # 5. Store in memory so /results can return it later
        scan_results[scan_id] = response
 
        return response
 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
    finally:
        # 6. Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
 

# ROUTE 3 — Get all past scan results
# GET: http://localhost:8000/results
 
@app.get("/results")
def get_all_results():
    """
    Returns all scans done in this session.
    React dashboard uses this to show history.
    """
    if not scan_results:
        return {
            "message": "No scans yet. Upload a CSV to /scan first.",
            "scans": []
        }
 
    # Return most recent first
    sorted_scans = sorted(
        scan_results.values(),
        key=lambda x: x["scanned_at"],
        reverse=True
    )
 
    return {
        "total_scans": len(sorted_scans),
        "scans": sorted_scans
    }
 