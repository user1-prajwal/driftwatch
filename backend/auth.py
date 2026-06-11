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


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """

    What it does:
    1. Reads JWT token from Authorization header
    2. Sends to Supabase to verify it's valid
    3. Returns the user object if valid
    4. Raises 401 error if invalid/expired
    """

    token = credentials.credentials

    try:
        # Supabase verifies the JWT and returns user data
        response = supabase_anon.auth.get_user(token)

        if not response or not response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token. Please log in again."
            )

        return response.user

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed. Please log in again."
        )

