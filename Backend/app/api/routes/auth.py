from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, LoginResponse
from app.db.supabase import supabase
from app.core.config import logger
from app.core.settings import settings

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login_endpoint(request: LoginRequest):
    """
    Authenticates a user using Supabase Auth.
    Falls back to a mock authentication if Supabase is not configured (for local development).
    """
    email = request.email.lower().strip()
    password = request.password
    
    # Check if Supabase client is configured
    is_supabase_configured = (
        supabase is not None 
        and settings.SUPABASE_URL != "https://placeholder-url.supabase.co"
        and settings.SUPABASE_KEY != "placeholder-anon-key"
    )
    
    if is_supabase_configured:
        try:
            logger.info(f"Attempting Supabase auth sign-in for email: {email}")
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            session = auth_response.session
            user = auth_response.user
            
            if not session or not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication failed. Invalid email or password."
                )
                
            return LoginResponse(
                access_token=session.access_token,
                token_type="bearer",
                user_id=user.id,
                user_email=user.email
            )
            
        except Exception as e:
            logger.error(f"Supabase auth error for {email}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication failed: {str(e)}"
            )
    else:
        logger.warning(f"Supabase not configured. Performing mock sign-in for {email}")
        
        # For testing, accept standard admin credentials or any development login
        if email == "admin@indhulya.com" and password == "admin123":
            return LoginResponse(
                access_token="mock-jwt-token-xyz-123",
                token_type="bearer",
                user_id="mock-user-id-0000-0000",
                user_email=email
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed. Invalid mock credentials. (Use 'admin@indhulya.com' and 'admin123' for local tests)."
            )
