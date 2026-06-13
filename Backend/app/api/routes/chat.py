from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from app.schemas.chat import ChatRequest, ChatResponse, SessionCreate, SessionResponse, SessionDetailResponse
from app.services.chat_service import ChatService
from app.services.session_service import SessionService
from app.core.config import logger
from app.api.deps import get_current_user
from app.core.limiter import limiter

router = APIRouter()

@router.post("", response_model=ChatResponse)
@limiter.limit("60/minute")
def chat_endpoint(request: Request, chat_req: ChatRequest, user = Depends(get_current_user)):
    """
    Receives user messages and forwards processing to the Chat Service.
    """
    try:
        return ChatService.process_chat(chat_req, user.id)
    except Exception as e:
        logger.error(f"Failure in chat routing endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error processing chatbot request: {str(e)}"
        )

@router.get("/sessions", response_model=List[SessionResponse])
@limiter.limit("60/minute")
def get_sessions_endpoint(request: Request, user = Depends(get_current_user)):
    """
    Retrieves all chat sessions for the current authenticated user.
    """
    return SessionService.get_sessions(user.id)

@router.post("/sessions", response_model=SessionResponse)
@limiter.limit("60/minute")
def create_session_endpoint(request: Request, session_req: SessionCreate, user = Depends(get_current_user)):
    """
    Creates a new empty chat session.
    """
    title = session_req.title or "New Chat Session"
    return SessionService.create_session(user.id, title)

@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
@limiter.limit("60/minute")
def get_session_detail_endpoint(request: Request, session_id: str, user = Depends(get_current_user)):
    """
    Retrieves a specific chat session with its messages.
    """
    return SessionService.get_session(session_id, user.id)

@router.delete("/sessions/{session_id}")
@limiter.limit("60/minute")
def delete_session_endpoint(request: Request, session_id: str, user = Depends(get_current_user)):
    """
    Deletes a specific chat session.
    """
    return SessionService.delete_session(session_id, user.id)
