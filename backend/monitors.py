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

