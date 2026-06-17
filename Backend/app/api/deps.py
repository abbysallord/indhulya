from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.db.supabase import supabase
from app.db import queries
from app.core.config import logger

security = HTTPBearer()

class MockUser:
    def __init__(self, id: str, email: str, full_name: str):
        self.id = id
        self.email = email
        self.user_metadata = {
            "name": full_name,
            "full_name": full_name
        }

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validates the token. First checks if it is a local mock token.
    Otherwise, validates against Supabase Auth.
    Raises 401 Unauthorized if the token is invalid or missing.
    """
    token = credentials.credentials
    if token.startswith("mock_token_"):
        user_id = token.replace("mock_token_", "")
        try:
            profile = queries.get_user_profile_by_id(user_id)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid session user profile",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return MockUser(id=profile["id"], email=profile["email"], full_name=profile["full_name"])
        except Exception as e:
            logger.error(f"Error querying mock token profile: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    try:
        # Verify token with Supabase client (fallback)
        auth_response = supabase.auth.get_user(token)
        user = auth_response.user
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return user
        
    except Exception as e:
        logger.error(f"Error validating user token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_optional_current_user(request: Request) -> Optional[dict]:
    """
    Optional authentication dependency.
    If the Authorization header is present, validates it locally or via Supabase.
    If it is absent, returns None (allowing guest access).
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
        
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
        
    token = parts[1]
    if token.startswith("mock_token_"):
        user_id = token.replace("mock_token_", "")
        try:
            profile = queries.get_user_profile_by_id(user_id)
            if profile:
                return MockUser(id=profile["id"], email=profile["email"], full_name=profile["full_name"])
            return None
        except Exception as e:
            logger.error(f"Error in optional mock token validation: {str(e)}")
            return None

    try:
        auth_response = supabase.auth.get_user(token)
        user = auth_response.user
        return user
    except Exception as e:
        logger.error(f"Error validating optional user token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
