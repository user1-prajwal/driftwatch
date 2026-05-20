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

