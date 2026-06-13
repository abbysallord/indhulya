from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr = Field(
        ...,
        description="The user's registered email address."
    )
    password: str = Field(
        ...,
        description="The user's password.",
        min_length=8,
        pattern=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    )

class LoginResponse(BaseModel):
    access_token: str = Field(
        ...,
        description="JWT access token for authenticating future API requests."
    )
    token_type: str = Field(
        "bearer",
        description="Type of token returned (always 'bearer')."
    )
    user_id: str = Field(
        ...,
        description="The unique user ID from the database/auth provider."
    )
    user_email: str = Field(
        ...,
        description="The email address associated with the authenticated user."
    )
