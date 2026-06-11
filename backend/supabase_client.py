import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL         = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY    = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# ──────────────────────────────────────────────
# Two clients:
#
# supabase_anon    → for normal operations
#                    respects Row Level Security
#                    use this for user operations
#
# supabase_admin   → bypasses Row Level Security
#                    use this for scheduler
#                    (scheduler runs as server,
#                     not as a specific user)
# ──────────────────────────────────────────────

supabase_anon: Client  = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# try:
#     response = supabase_admin.table("monitors").select("*").execute()
    
#     print("✅ Connection SUCCESS")
#     print("Data:", response.data)

# except Exception as e:
#     print("❌ Connection FAILED")
#     print("Error:", e)