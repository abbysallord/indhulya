from app.schemas.chat import ChatRequest, ChatResponse
from app.db import queries
from app.core.config import logger
from fastapi import HTTPException

class ChatService:
    @staticmethod
    def process_chat(request: ChatRequest, user_id: str) -> ChatResponse:
        """
        Processes a user query: creates or validates a chat session,
        persists messages via DB functions, and generates a response.
        """
        session_id = request.session_id
        
        # Validate or create session
        if session_id and session_id.strip() != "":
            # Verify ownership
            session = queries.get_chat_session_by_id(session_id, user_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found or not owned by user.")
        else:
            # Create a new session
            new_session = queries.create_chat_session(user_id=user_id, title=request.message[:50])
            session_id = new_session["id"]
            logger.info(f"Generated new session_id: {session_id} for user {user_id}")
            
        user_message = request.message
        
        # Save user query to DB
        queries.save_chat_message(session_id=session_id, role="user", content=user_message)
        
        # Generate real response from Groq API via LLMService
        from app.services.llm_service import llm_service
        # Ideally, we fetch previous messages here and pass to llm_service.
        # But keeping it simple as per original design.
        assistant_reply = llm_service.generate_chat_response(user_message)
        
        # Save assistant response to DB
        queries.save_chat_message(session_id=session_id, role="assistant", content=assistant_reply)
        
        return ChatResponse(
            response=assistant_reply,
            session_id=session_id
        )
