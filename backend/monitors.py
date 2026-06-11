from datetime import datetime
from supabase_client import supabase_admin
 
 
# CREATE a new monitor
def create_monitor(
    user_id,
    name,
    source_type,
    source_value,
    date_column,
    context,
    sensitivity,
    alert_email,
    interval_hours,
):
    """
    Saves a new monitor to Supabase.
    user_id comes from the JWT token — not from user input.
    This means users can never create monitors for other users.
    """
 
    data = {
        "user_id":       user_id,
        "name":          name,
        "source_type":   source_type,
        "source_value":  source_value,
        "date_column":   date_column,
        "context":       context,
        "sensitivity":   sensitivity,
        "alert_email":   alert_email,
        "interval_hours":interval_hours,
        "status":        "active",
    }
 
    response = supabase_admin.table("monitors").insert(data).execute()
 
    if not response.data:
        raise Exception("Failed to create monitor in database.")
 
    monitor = response.data[0]
    print(f"✅ Monitor created: '{name}' for user {user_id[:8]}...")
    return monitor