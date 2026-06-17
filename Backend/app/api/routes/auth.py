from fastapi import APIRouter, HTTPException, status, Request
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.db.supabase import supabase
from app.db import queries
from app.core.config import logger
from app.core.settings import settings
from app.core.limiter import limiter

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
def login_endpoint(request: Request, login_data: LoginRequest):
    """
    Authenticates a user using Supabase Auth.
    Falls back to a mock authentication if Supabase is not configured (for local development).
    """
    email = login_data.email.lower().strip()
    password = login_data.password
    
    # Check if Supabase client is configured
    is_supabase_configured = (
        supabase is not None 
        and settings.SUPABASE_URL != "https://placeholder-url.supabase.co"
        and getattr(settings, "SUPABASE_ANON_KEY", "placeholder-anon-key") != "placeholder-anon-key"
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
        logger.error(f"Supabase not configured. Rejecting login attempt for {email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service is not configured."
        )

@router.post("/register", response_model=RegisterResponse)
@limiter.limit("10/minute")
def register_endpoint(request: Request, reg_data: RegisterRequest):
    """
    Registers a user using Supabase Auth and logs their details in the profiles table.
    """
    full_name = reg_data.full_name.strip()
    email = reg_data.email.lower().strip()
    password = reg_data.password
    
    # Check if Supabase client is configured
    is_supabase_configured = (
        supabase is not None 
        and settings.SUPABASE_URL != "https://placeholder-url.supabase.co"
        and getattr(settings, "SUPABASE_ANON_KEY", "placeholder-anon-key") != "placeholder-anon-key"
    )
    
    if not is_supabase_configured:
        logger.error(f"Supabase not configured. Rejecting registration attempt for {email}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service is not configured."
        )
        
    try:
        logger.info(f"Attempting Supabase registration for email: {email}")
        # Sign up the user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "full_name": full_name
                }
            }
        })
        
        user = auth_response.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Could not create user account."
            )
            
        # Create public profile log
        try:
            profile = queries.create_user_profile(
                user_id=user.id,
                email=email,
                full_name=full_name
            )
            if not profile:
                logger.warning(f"Registration succeeded but public profile row was not created for user {user.id}")
        except Exception as profile_err:
            logger.error(f"Error creating public profile row for user {user.id}: {str(profile_err)}")
            # We don't fail the registration if the profile fails (e.g. database trigger already created it)
            
        return RegisterResponse(
            user_id=user.id,
            user_email=user.email,
            message="User successfully registered."
        )
        
    except Exception as e:
        logger.error(f"Supabase registration error for {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

