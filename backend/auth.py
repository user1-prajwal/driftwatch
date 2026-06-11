import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase_client import supabase_anon
from dotenv import load_dotenv

load_dotenv()

# HTTPBearer reads the Authorization header
# Format: "Bearer YOUR_JWT_TOKEN"
# Frontend sends this with every request

security = HTTPBearer()
