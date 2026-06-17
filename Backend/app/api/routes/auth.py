from fastapi import APIRouter, HTTPException, status, Request
import uuid
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.db.supabase import supabase
from app.db import queries
from app.core.config import logger
from app.core.settings import settings
from app.core.limiter import limiter
from app.utils.security import hash_password, verify_password

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
def login_endpoint(request: Request, login_data: LoginRequest):
    """
    Authenticates a user by checking their credentials against the public.profiles database table.
    """
    email = login_data.email.lower().strip()
    password = login_data.password
    
    try:
        logger.info(f"Attempting local database validation for email: {email}")
        user = queries.get_user_profile_by_email(email)
        
        # Verify the password using bcrypt comparison
        if not user or not verify_password(password, user.get("password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed. Invalid email or password."
            )
            
        return LoginResponse(
            access_token=f"mock_token_{user['id']}",
            token_type="bearer",
            user_id=user["id"],
            user_email=user["email"]
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Local auth login error for {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )

@router.post("/register", response_model=RegisterResponse)
@limiter.limit("10/minute")
def register_endpoint(request: Request, reg_data: RegisterRequest):
    """
    Registers a user by saving their credentials directly in the public.profiles table.
    """
    full_name = reg_data.full_name.strip()
    email = reg_data.email.lower().strip()
    password = reg_data.password
    
    try:
        logger.info(f"Attempting local database signup for email: {email}")
        
        # Check if email is already registered
        existing_user = queries.get_user_profile_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address already registered."
            )
            
        # Create a new local user UUID, hash the password, and save
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(password)
        
        profile = queries.create_user_profile(
            user_id=user_id,
            email=email,
            full_name=full_name,
            password=hashed_password
        )
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration failed. Could not create database profile record."
            )
            
        return RegisterResponse(
            user_id=profile["id"],
            user_email=profile["email"],
            message="User successfully registered."
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Local auth registration error for {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )
