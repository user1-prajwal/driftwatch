import os
import uuid
import shutil
from datetime import datetime

import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from detector import run_driftwatch
from alerts import send_email_alert

# Create FastAPI app

app = FastAPI(
    title="DriftWatch API",
    description="AI-powered data quality monitor",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for scan results
scan_results = {}


# ROUTE 1 — Health check

@app.get("/health")
def health_check():
    return {
        "status":    "ok",
        "message":   "DriftWatch is running",
        "timestamp": datetime.now().isoformat()
    }


# ROUTE 2 — Scan a CSV file

@app.post("/scan")
async def scan_file(
    file:             UploadFile = File(...),
    date_column:      str        = Form(...),
    context:          str        = Form(...),
    sensitivity:      str        = Form("medium"),
    recipient_email:  str        = Form("")        # optional — empty means no email
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    if sensitivity not in ["low", "medium", "high"]:
        raise HTTPException(status_code=400, detail="sensitivity must be 'low', 'medium', or 'high'.")

    temp_path = f"data/temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        results = run_driftwatch(
            filepath    = temp_path,
            date_column = date_column,
            context     = context,
            sensitivity = sensitivity
        )

        scan_id  = str(uuid.uuid4())[:8]
        critical = [r for r in results if "CRITICAL" in r["status"]]
        warnings = [r for r in results if "WARNING"  in r["status"]]
        normal   = [r for r in results if "NORMAL"   in r["status"]]

        response = {
            "scan_id":     scan_id,
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
                )
            },
            "columns": results,
            "email_alert": None
        }

        # Send email alert if recipient provided
        if recipient_email.strip():
            email_result = send_email_alert(recipient_email.strip(), response)
            response["email_alert"] = email_result

        scan_results[scan_id] = response
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ROUTE 3 — Get all past scan results

@app.get("/results")
def get_all_results():
    if not scan_results:
        return {"message": "No scans yet.", "scans": []}

    sorted_scans = sorted(
        scan_results.values(),
        key=lambda x: x["scanned_at"],
        reverse=True
    )
    return {"total_scans": len(sorted_scans), "scans": sorted_scans}


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