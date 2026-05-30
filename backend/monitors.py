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

