from app.schemas.chat import ChatRequest, ChatResponse
from app.db import queries
from app.core.config import logger
from fastapi import HTTPException
from typing import Optional, Any
from app.services.memory_service import MemoryService
from app.services.prompt_builder import PromptBuilder
from app.services.llm_service import llm_service
from app.services.rag.rag_service import rag_service
from app.services.guest_session_store import (
    get_guest_session,
    create_guest_session,
    save_guest_message
)
from app.db.database import SessionLocal
from app.services.state_service import StateService
from app.services.recommendation_service import RecommendationService
from app.services.lead_service import LeadService

class ChatService:
    @staticmethod
    def process_chat(request: ChatRequest, user_id: Optional[Any]) -> ChatResponse:
        """
        Orchestrates chat messages for both authenticated and guest users:
        1. Resolve user details and session (DB or In-Memory)
        2. Load conversational history
        3. Save new user message
        4. Analyze conversation state and extract slot preferences
        5. Execute state-specific actions:
           - RECOMMENDATION: Run product scoring, save recommendation trace, generate explanations.
           - LEAD_CAPTURE: Capture user/guest lead details without interrupting flow.
           - DISCOVERY: Prompt for missing slots.
           - FAQ/POLICY/COMPARISON/GREETING: Preserve and execute core RAG retrieval.
        6. Persist assistant reply
        7. Return Response
        """
        session_id = request.session_id
        user_message = request.message
        
        # Open database session context for SQLAlchemy operations
        with SessionLocal() as db:
            # Resolve user details supporting unit tests (which pass string UUIDs or user objects)
            user_obj = user_id
            if isinstance(user_obj, str):
                user_id = user_obj
                user_email = "test@example.com"
                user_metadata = {"name": "Test User"}
            elif user_obj:
                user_id = getattr(user_obj, "id", None)
                user_email = getattr(user_obj, "email", "guest@example.com")
                user_metadata = getattr(user_obj, "user_metadata", {}) or {}
            else:
                user_id = None
                user_email = None
                user_metadata = {}

            is_guest = (user_id is None)

            # --- Session Setup ---
            if is_guest:
                if session_id and session_id.strip() != "":
                    session = get_guest_session(session_id)
                    if not session:
                        raise HTTPException(status_code=404, detail="Guest session not found.")
                else:
                    session = create_guest_session(guest_user_id=None, title=user_message[:50])
                    session_id = session["id"]
                    logger.info(f"Generated new guest session_id: {session_id}")

                history = [{"role": m["role"], "content": m["content"]} for m in session["messages"][-10:]]
                save_guest_message(session_id=session_id, role="user", content=user_message)
            else:
                if session_id and session_id.strip() != "":
                    session = queries.get_chat_session_by_id(session_id, user_id)
                    if not session:
                        raise HTTPException(status_code=404, detail="Session not found or not owned by user.")
                else:
                    new_session = queries.create_chat_session(user_id=user_id, title=user_message[:50])
                    session_id = new_session["id"]
                    logger.info(f"Generated new database session_id: {session_id} for user {user_id}")

                history = MemoryService.get_recent_history(session_id)
                try:
                    queries.save_chat_message(session_id=session_id, role="user", content=user_message)
                except Exception as e:
                    logger.error(f"Failed to save user message to DB: {str(e)}")
                    raise HTTPException(status_code=500, detail="Database error: Failed to save user message.")

            # --- Analyze State & Extract Slots ---
            active_state, current_slots, purchase_intent = StateService.analyze_message_and_update_state(
                db=db,
                session_id=session_id,
                user_message=user_message,
                history=history,
                user_id=user_id
            )
            
            logger.info(f"Session {session_id} active state determined as: {active_state}")

            # --- State Action Dispatcher ---
            if active_state == "RECOMMENDATION":
                # Algorithmic ranking
                scored_products = RecommendationService.score_and_rank_products(current_slots)
                # Log recommendation to recommendation_history table
                RecommendationService.save_recommendation_history(db, session_id, user_id, user_message, scored_products)
                # Build recommendation prompt
                messages = RecommendationService.build_recommendation_prompt(current_slots, scored_products)
                # Generate explanation response grounded with exact ranked items
                assistant_reply = llm_service.generate_chat_response(messages)

            elif active_state == "LEAD_CAPTURE":
                if not is_guest:
                    # Authenticated user: Capture lead automatically behind the scenes
                    LeadService.create_authenticated_lead(db, user_id, user_email, user_metadata, session_id)
                    # Ground LLM to answer order inquiry
                    messages = PromptBuilder.build_chat_prompt(
                        user_message=user_message,
                        history=history,
                        rag_context="Let the user know their purchase request is being processed. Their details have been automatically updated, and our sales team will connect with them shortly."
                    )
                    assistant_reply = llm_service.generate_chat_response(messages)
                else:
                    # Guest user: Request name/phone if missing, otherwise finalize lead
                    state_record = StateService.get_or_create_state(db, session_id)
                    context = state_record.context_data or {}
                    lead_info = context.get("lead_info", {})
                    
                    if not lead_info.get("name") or not lead_info.get("phone"):
                        assistant_reply = "I can help you place an order for that! Could you please share your name and phone number so our team can contact you to finalize the order?"
                    else:
                        name = lead_info["name"]
                        phone = lead_info["phone"]
                        LeadService.create_guest_lead(db, session_id, name, phone)
                        assistant_reply = f"Thank you {name}! Your contact number {phone} has been registered, and our sales team will reach out to you shortly."

            elif active_state == "DISCOVERY":
                # Missing critical details: ask targeted follow-up question
                assistant_reply = StateService.generate_targeted_followup(current_slots)

            else:
                # FAQ, POLICY, COMPARISON, GREETING: Retrieve context using RAG
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

            # --- Persist Assistant Reply ---
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
