from app.schemas.chat import ChatRequest, ChatResponse
from app.db import queries
from app.core.config import logger
from fastapi import HTTPException
from typing import Optional
from app.services.memory_service import MemoryService
from app.services.prompt_builder import PromptBuilder
from app.services.llm_service import llm_service
from app.services.rag.rag_service import rag_service
from app.services.guest_session_store import (
    get_guest_session,
    create_guest_session,
    save_guest_message
)

class ChatService:
    @staticmethod
    def process_chat(request: ChatRequest, user_id: Optional[str]) -> ChatResponse:
        """
        Orchestrates chat messages for both authenticated and guest users:
        1. Validate/Create session (DB or In-Memory)
        2. Load conversational history
        3. Save new user message
        4. Query and fetch RAG context from the catalog
        5. Build formatted prompt
        6. Request LLM completion
        7. Save assistant reply
        8. Return Response
        """
        session_id = request.session_id
        user_message = request.message
        is_guest = (user_id is None)

        if is_guest:
            # --- Guest User Session Workflow (In-Memory) ---
            if session_id and session_id.strip() != "":
                session = get_guest_session(session_id)
                if not session:
                    raise HTTPException(status_code=404, detail="Guest session not found.")
            else:
                session = create_guest_session(guest_user_id=None, title=user_message[:50])
                session_id = session["id"]
                logger.info(f"Generated new guest session_id: {session_id}")

            # Retrieve memory history BEFORE saving user message to avoid duplicate injection
            history = [{"role": m["role"], "content": m["content"]} for m in session["messages"][-10:]]

            # Save user message to memory
            save_guest_message(session_id=session_id, role="user", content=user_message)
        else:
            # --- Authenticated User Session Workflow (Database) ---
            if session_id and session_id.strip() != "":
                session = queries.get_chat_session_by_id(session_id, user_id)
                if not session:
                    raise HTTPException(status_code=404, detail="Session not found or not owned by user.")
            else:
                new_session = queries.create_chat_session(user_id=user_id, title=user_message[:50])
                session_id = new_session["id"]
                logger.info(f"Generated new database session_id: {session_id} for user {user_id}")

            # Retrieve memory history BEFORE saving user message to avoid duplicate injection
            history = MemoryService.get_recent_history(session_id)

            # Save user message to DB
            try:
                queries.save_chat_message(session_id=session_id, role="user", content=user_message)
            except Exception as e:
                logger.error(f"Failed to save user message to DB: {str(e)}")
                raise HTTPException(status_code=500, detail="Database error: Failed to save user message.")

        # --- Shared Retrieval & LLM Generation Pipeline ---
        # Fetch matching catalog context
        try:
            rag_context = rag_service.get_context(user_message)
        except Exception as e:
            logger.error(f"Failed to fetch matching catalog context: {str(e)}")
            rag_context = "" # Fallback gracefully

        # Build prompt messages
        messages = PromptBuilder.build_chat_prompt(user_message=user_message, history=history, rag_context=rag_context)

        # Generate response from Groq
        try:
            assistant_reply = llm_service.generate_chat_response(messages)
        except Exception as e:
            logger.error(f"Failed to generate response for session {session_id}: {str(e)}")
            raise HTTPException(
                status_code=502,
                detail=f"Error generating chat response: {str(e)}"
            )

        # Persist assistant reply
        if is_guest:
            save_guest_message(session_id=session_id, role="assistant", content=assistant_reply)
        else:
            try:
                queries.save_chat_message(session_id=session_id, role="assistant", content=assistant_reply)
            except Exception as e:
                logger.error(f"Failed to save assistant message to DB: {str(e)}")
                raise HTTPException(status_code=500, detail="Database error: Failed to save assistant response.")

        return ChatResponse(
            response=assistant_reply,
            session_id=session_id
        )
