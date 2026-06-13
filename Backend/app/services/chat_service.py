from app.schemas.chat import ChatRequest, ChatResponse
from app.db import queries
from app.core.config import logger
from fastapi import HTTPException
from app.services.memory_service import MemoryService
from app.services.prompt_builder import PromptBuilder
from app.services.llm_service import llm_service
from app.services.rag.rag_service import rag_service

class ChatService:
    @staticmethod
    def process_chat(request: ChatRequest, user_id: str) -> ChatResponse:
        """
        Processes a user query using the orchestration pipeline:
        1. Validate or create session
        2. Load history (memory) for the session
        3. Save new user message to DB
        4. Fetch RAG context (placeholder)
        5. Build the LLM prompt (system prompt + history + RAG context + current message)
        6. Call LLM Service
        7. Save assistant reply to DB
        8. Return ChatResponse
        """
        session_id = request.session_id
        user_message = request.message
        
        # 1. Validate or create session
        if session_id and session_id.strip() != "":
            # Verify ownership
            session = queries.get_chat_session_by_id(session_id, user_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found or not owned by user.")
        else:
            # Create a new session
            new_session = queries.create_chat_session(user_id=user_id, title=user_message[:50])
            session_id = new_session["id"]
            logger.info(f"Generated new session_id: {session_id} for user {user_id}")
            
        # 2. Load recent history (memory) BEFORE saving the new user message to avoid duplication
        history = MemoryService.get_recent_history(session_id)
        
        # 3. Save user query to DB
        try:
            queries.save_chat_message(session_id=session_id, role="user", content=user_message)
        except Exception as e:
            logger.error(f"Failed to save user message to DB: {str(e)}")
            raise HTTPException(status_code=500, detail="Database error: Failed to save user message.")
        
        # 4. Fetch RAG context
        try:
            rag_context = rag_service.get_context(user_message)
        except Exception as e:
            logger.error(f"Failed to fetch RAG context: {str(e)}")
            rag_context = "" # Fallback gracefully
        
        # 5. Build prompt
        messages = PromptBuilder.build_chat_prompt(user_message=user_message, history=history, rag_context=rag_context)
        
        # 6. Generate response from LLMService
        try:
            assistant_reply = llm_service.generate_chat_response(messages)
        except Exception as e:
            logger.error(f"Failed to generate response for session {session_id}: {str(e)}")
            raise HTTPException(
                status_code=502,
                detail=f"Error generating chat response: {str(e)}"
            )
        
        # 7. Save assistant response to DB
        try:
            queries.save_chat_message(session_id=session_id, role="assistant", content=assistant_reply)
        except Exception as e:
            logger.error(f"Failed to save assistant message to DB: {str(e)}")
            raise HTTPException(status_code=500, detail="Database error: Failed to save assistant response.")
        
        return ChatResponse(
            response=assistant_reply,
            session_id=session_id
        )
