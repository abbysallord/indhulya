from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatRequest(BaseModel):
    session_id: Optional[str] = Field(
        None, 
        description="Unique identifier for the chat session. If not provided, a new one will be generated."
    )
    message: str = Field(
        ..., 
        description="The content of the user's query.",
        min_length=1
    )

class ChatResponse(BaseModel):
    response: str = Field(
        ..., 
        description="The generated response text from the assistant."
    )
    session_id: str = Field(
        ..., 
        description="The session identifier associated with this response."
    )

class SessionCreate(BaseModel):
    title: Optional[str] = Field(None, description="Title of the session")

class SessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime

class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime

class SessionDetailResponse(SessionResponse):
    messages: List[MessageResponse]
