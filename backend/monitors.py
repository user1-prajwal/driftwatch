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


# GET monitors — scoped by user_id
def get_all_monitors(user_id):
    """
    Returns only monitors belonging to this user.
    Even though RLS handles this at DB level,
    we also filter here as double protection.
    """
    response = (
        supabase_admin
        .table("monitors")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


def get_monitor(monitor_id, user_id):
    """
    Returns one monitor — only if it belongs to this user.
    """
    response = (
        supabase_admin
        .table("monitors")
        .select("*")
        .eq("id", monitor_id)
        .eq("user_id", user_id)
        .execute()
    )
    data = response.data
    return data[0] if data else None