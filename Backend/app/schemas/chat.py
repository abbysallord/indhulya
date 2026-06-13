from pydantic import BaseModel, Field
from typing import Optional

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
