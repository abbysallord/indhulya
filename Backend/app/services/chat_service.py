import uuid
from app.schemas.chat import ChatRequest, ChatResponse
from app.db import queries
from app.core.config import logger
from fastapi import HTTPException
from typing import Optional, Any
from app.services.conversation_orchestrator import ConversationOrchestrator

class ChatService:
    @staticmethod
    def process_chat(request: ChatRequest, user_id: Optional[Any]) -> ChatResponse:
        """
        Orchestrates chat messages for both authenticated and guest users.
        Resolves user_id object to string, then delegates to ConversationOrchestrator.
        """
        # Resolve user details supporting unit tests (which pass string UUIDs or user objects)
        user_obj = user_id
        resolved_user_id = None
        if isinstance(user_obj, str):
            resolved_user_id = user_obj
        elif user_obj:
            resolved_user_id = getattr(user_obj, "id", None)

        try:
            return ConversationOrchestrator.orchestrate_chat(request, resolved_user_id)
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Failure in chat processing orchestration: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error processing chatbot request: {str(e)}"
            )
