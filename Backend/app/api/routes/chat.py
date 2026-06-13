from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.core.config import logger

router = APIRouter()

@router.post("", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Receives user messages and forwards processing to the Chat Service.
    """
    try:
        return ChatService.process_chat(request)
    except Exception as e:
        logger.error(f"Failure in chat routing endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error processing chatbot request: {str(e)}"
        )
