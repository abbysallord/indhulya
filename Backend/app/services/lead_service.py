import uuid
from typing import Optional, List, Dict, Any
from app.db import queries
from app.core.config import logger
from app.services.llm_service import llm_service

class LeadService:
    @staticmethod
    def extract_discussed_products(history: List[Dict[str, str]], current_message: str, assistant_reply: str) -> List[Dict[str, Any]]:
        """
        Scans all messages for catalog products and returns a structured list with interaction type.
        """
        from app.services.recommendation_service import RecommendationService
        products = RecommendationService.get_all_products()
        discussed = {}
        
        all_turns = list(history or []) + [
            {"role": "user", "content": current_message},
            {"role": "assistant", "content": assistant_reply}
        ]
        
        for turn in all_turns:
            role = turn.get("role")
            content = (turn.get("content") or "").lower()
            
            for p in products:
                p_id = p["id"].lower()
                p_name = p["name"].lower()
                
                if p_id in content or p_name in content:
                    p_key = p["id"]
                    if p_key not in discussed:
                        discussed[p_key] = {
                            "id": p["id"],
                            "name": p["name"],
                            "price": p["price"],
                            "category": p["category"],
                            "interactions": set()
                        }
                    
                    if role == "assistant":
                        discussed[p_key]["interactions"].add("recommended")
                    else:
                        is_comparing = any(w in content for w in ["compare", "vs", "difference", "better than"])
                        if is_comparing:
                            discussed[p_key]["interactions"].add("compared")
                        else:
                            discussed[p_key]["interactions"].add("viewed")

        results = []
        for p_id, info in discussed.items():
            results.append({
                "id": info["id"],
                "name": info["name"],
                "price": info["price"],
                "category": info["category"],
                "interaction": list(info["interactions"])[0] if info["interactions"] else "viewed"
            })
        return results

    @staticmethod
    def generate_conversation_summary(history: List[Dict[str, str]], current_message: str, assistant_reply: str) -> str:
        """
        Calls the LLM to generate a concise summary of the conversation.
        """
        if not llm_service.client:
            return "Customer is interested in jewelry catalog and is exploring options."
            
        system_content = (
            "You are a sales operations assistant. Summarize the following jewelry store chatbot conversation into a concise "
            "one-sentence summary for sales representatives. Highlight customer interests, metal/material "
            "preferences, budget range, and any specific products they asked about.\n"
            "Example format: 'Customer is interested in bridal jewelry, prefers 22K gold, budget around $1000, showed interest in Lotus Necklace.'\n"
            "Conversation history:\n"
        )
        
        messages = [{"role": "system", "content": system_content}]
        for msg in (history or []):
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": current_message})
        messages.append({"role": "assistant", "content": assistant_reply})
        
        try:
            summary = llm_service.generate_chat_response(messages)
            return summary.strip()
        except Exception as e:
            logger.error(f"Failed to generate conversation summary: {str(e)}")
            return "Customer is inquiring about products in the catalog."

    @classmethod
    def create_lead_record(
        cls, 
        user_id: Optional[str], 
        session_id: str, 
        name: Optional[str], 
        phone: Optional[str], 
        email: Optional[str], 
        slots: dict, 
        history: List[Dict[str, str]], 
        current_message: str, 
        assistant_reply: str
    ) -> Optional[Dict[str, Any]]:
        """
        Builds, logs, and persists a lead record into Supabase.
        """
        try:
            summary = cls.generate_conversation_summary(history, current_message, assistant_reply)
            interested = cls.extract_discussed_products(history, current_message, assistant_reply)
            
            b_min = slots.get("budget_min")
            b_max = slots.get("budget_max")
            if b_min is not None and b_max is not None:
                budget_str = f"${b_min} - ${b_max}"
            elif b_max is not None:
                budget_str = f"Under ${b_max}"
            elif b_min is not None:
                budget_str = f"Over ${b_min}"
            else:
                budget_str = "Not specified"
                
            lead_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "session_id": session_id,
                "name": name,
                "phone": phone,
                "email": email,
                "interested_products": interested,
                "budget": budget_str,
                "material_preference": slots.get("material"),
                "occasion": slots.get("occasion"),
                "conversation_summary": summary,
                "lead_source": "chatbot",
                "status": "captured"
            }
            
            lead = queries.create_lead(lead_data)
            if lead:
                logger.info(f"Successfully captured lead {lead.get('id')} for session {session_id}.")
                
                # For guests: Only persist recommendation history if a lead is captured
                if not user_id and interested:
                    cls._persist_guest_recommendation_history(session_id, current_message, interested)
                    
            return lead
        except Exception as e:
            logger.error(f"Failed to capture lead: {str(e)}")
            return None

    @staticmethod
    def _persist_guest_recommendation_history(session_id: str, query: str, interested_products: List[dict]):
        """
        Saves recommendation traces for guest recommendations when a lead is captured.
        """
        rec_products = [p["id"] for p in interested_products if p["interaction"] == "recommended"]
        if rec_products:
            scores_dict = {pid: 10.0 for pid in rec_products}
            queries.save_recommendation_history(
                session_id=session_id,
                user_id=None,
                query=query,
                recommended_products=rec_products,
                scores=scores_dict
            )
