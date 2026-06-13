from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.db.supabase import supabase
from app.core.config import logger

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validates the JWT token against Supabase Auth and returns the user object.
    Raises 401 Unauthorized if the token is invalid or missing.
    """
    token = credentials.credentials
    try:
        # Verify token with Supabase client
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
    If the Authorization header is present, validates it.
    If it is absent, returns None (allowing guest access).
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
        
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
        
    token = parts[1]
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
