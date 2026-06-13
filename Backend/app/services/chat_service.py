import uuid
from app.schemas.chat import ChatRequest, ChatResponse
from app.db import queries
from app.core.config import logger

class ChatService:
    @staticmethod
    def process_chat(request: ChatRequest) -> ChatResponse:
        """
        Processes a user query: creates or updates a chat session,
        persists messages via mock DB functions, and generates a response.
        """
        session_id = request.session_id
        
        # Create session if not exists
        if not session_id or session_id.strip() == "":
            session_id = str(uuid.uuid4())
            logger.info(f"Generated new session_id: {session_id}")
            queries.create_chat_session(session_id)
            
        user_message = request.message
        
        # Save user query to DB (mock function call)
        queries.save_chat_message(session_id=session_id, role="user", content=user_message)
        
        # Generate real response from Groq API via LLMService
        from app.services.llm_service import llm_service
        assistant_reply = llm_service.generate_chat_response(user_message)
        
        # Save assistant response to DB (mock function call)
        queries.save_chat_message(session_id=session_id, role="assistant", content=assistant_reply)
        
        return ChatResponse(
            response=assistant_reply,
            session_id=session_id
        )
