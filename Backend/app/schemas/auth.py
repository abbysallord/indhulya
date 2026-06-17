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
        min_length=8
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

class RegisterRequest(BaseModel):
    full_name: str = Field(
        ...,
        description="The user's full name."
    )
    email: EmailStr = Field(
        ...,
        description="The user's registered email address."
    )
    password: str = Field(
        ...,
        description="The user's password.",
        min_length=8
    )

class RegisterResponse(BaseModel):
    user_id: str = Field(
        ...,
        description="The unique user ID created in the database."
    )
    user_email: str = Field(
        ...,
        description="The registered email address."
    )
    message: str = Field(
        "User successfully registered",
        description="A message confirming registration status."
    )

