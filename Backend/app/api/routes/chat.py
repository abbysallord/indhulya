from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
import uuid
from datetime import datetime, timezone
from app.schemas.chat import ChatRequest, ChatResponse, SessionCreate, SessionResponse, SessionDetailResponse
from app.services.chat_service import ChatService
from app.services.session_service import SessionService
from app.core.config import logger
from app.api.deps import get_optional_current_user
from app.core.limiter import limiter

router = APIRouter()

@router.post("", response_model=ChatResponse)
@limiter.limit("60/minute")
def chat_endpoint(request: Request, chat_req: ChatRequest, user = Depends(get_optional_current_user)):
    """
    Receives user messages and forwards processing to the Chat Service.
    Supports both authenticated and anonymous guest requests.
    """
    try:
        return ChatService.process_chat(chat_req, user)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failure in chat routing endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error processing chatbot request: {str(e)}"
        )

@router.get("/sessions", response_model=List[SessionResponse])
@limiter.limit("60/minute")
def get_sessions_endpoint(request: Request, user = Depends(get_optional_current_user)):
    """
    Retrieves all chat sessions for the current user.
    If authenticated, returns DB sessions. If anonymous, guest sessions are transient and not persisted.
    """
    if user:
        return SessionService.get_sessions(user.id)
    return []

@router.post("/sessions", response_model=SessionResponse)
@limiter.limit("60/minute")
def create_session_endpoint(request: Request, session_req: SessionCreate, user = Depends(get_optional_current_user)):
    """
    Creates a new empty chat session (in DB if authenticated, transient metadata returned if guest).
    """
    title = session_req.title or "New Chat Session"
    if user:
        return SessionService.create_session(user.id, title)
    else:
        guest_user_id = request.headers.get("x-guest-user-id") or f"guest_{uuid.uuid4()}"
        return {
            "id": f"guest_{uuid.uuid4()}",
            "user_id": guest_user_id,
            "title": title,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
@limiter.limit("60/minute")
def get_session_detail_endpoint(request: Request, session_id: str, user = Depends(get_optional_current_user)):
    """
    Retrieves a specific chat session with its messages.
    """
    if user:
        return SessionService.get_session(session_id, user.id)
    else:
        raise HTTPException(
            status_code=404, 
            detail="Guest sessions are transient and not stored on the server."
        )

@router.delete("/sessions/{session_id}")
@limiter.limit("60/minute")
def delete_session_endpoint(request: Request, session_id: str, user = Depends(get_optional_current_user)):
    """
    Deletes a specific chat session.
    """
    if user:
        return SessionService.delete_session(session_id, user.id)
    else:
        # Guests are transient: return success since there is nothing to delete
        return {"detail": "Session deleted"}
