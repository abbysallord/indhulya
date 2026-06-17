import json
import re
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.db.models import ConversationState, UserPreference
from app.core.config import logger
from app.services.llm_service import llm_service
from app.services.rag.classifier import QueryClassifier

class StateService:
    @staticmethod
    def get_or_create_state(db: Session, session_id: str) -> ConversationState:
        """
        Retrieves or creates a ConversationState record in the DB.
        """
        state_record = db.query(ConversationState).filter(ConversationState.session_id == session_id).first()
        if not state_record:
            state_record = ConversationState(
                session_id=session_id,
                state="GREETING",
                context_data={
                    "slots": {
                        "category": None,
                        "budget_min": None,
                        "budget_max": None,
                        "material": None,
                        "occasion": None,
                        "collection": None
                    },
                    "lead_info": {
                        "name": None,
                        "phone": None
                    },
                    "purchase_intent": False
                }
            )
            db.add(state_record)
            db.commit()
            db.refresh(state_record)
        return state_record

    @staticmethod
    def save_state(db: Session, state_record: ConversationState):
        """
        Commits conversation state changes to the database.
        """
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(state_record, "context_data")
        db.add(state_record)
        db.commit()

    @staticmethod
    def get_or_create_user_preferences(db: Session, user_id: str) -> UserPreference:
        """
        Retrieves or creates a UserPreference record in the DB.
        """
        pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        if not pref:
            pref = UserPreference(
                user_id=user_id,
                preferred_materials=[],
                preferred_categories=[],
                budget_min=None,
                budget_max=None,
                occasions=[],
                style_preferences=[]
            )
            db.add(pref)
            db.commit()
            db.refresh(pref)
        return pref

    @staticmethod
    def save_user_preferences(db: Session, pref: UserPreference):
        """
        Commits user preferences changes to the database.
        """
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(pref, "preferred_materials")
        flag_modified(pref, "preferred_categories")
        flag_modified(pref, "occasions")
        flag_modified(pref, "style_preferences")
        db.add(pref)
        db.commit()

    @classmethod
    def merge_preferences_to_slots(cls, slots: dict, pref: UserPreference) -> dict:
        """
        Fills missing slot attributes from stored database preferences.
        """
        updated_slots = dict(slots)
        
        # Merge Category
        if not updated_slots.get("category") and pref.preferred_categories:
            # Take the most recent category
            updated_slots["category"] = pref.preferred_categories[-1]
            
        # Merge Material
        if not updated_slots.get("material") and pref.preferred_materials:
            updated_slots["material"] = pref.preferred_materials[-1]
            
        # Merge Budget Range
        if updated_slots.get("budget_min") is None and pref.budget_min is not None:
            updated_slots["budget_min"] = pref.budget_min
        if updated_slots.get("budget_max") is None and pref.budget_max is not None:
            updated_slots["budget_max"] = pref.budget_max
            
        # Merge Occasion
        if not updated_slots.get("occasion") and pref.occasions:
            updated_slots["occasion"] = pref.occasions[-1]
            
        # Merge Collection (can fall back to first style if matching collection name)
        if not updated_slots.get("collection") and pref.style_preferences:
            # Check if any style matches collections
            for style in pref.style_preferences:
                if style.lower() in ["heritage", "aura", "nirvana"]:
                    updated_slots["collection"] = style.lower()
                    break
                    
        return updated_slots

    @classmethod
    def update_user_preferences_from_slots(cls, pref: UserPreference, slots: dict):
        """
        Updates the persistent UserPreference record with newly extracted slots.
        """
        if slots.get("material"):
            mats = list(pref.preferred_materials or [])
            if slots["material"] not in mats:
                mats.append(slots["material"])
            pref.preferred_materials = mats
            
        if slots.get("category"):
            cats = list(pref.preferred_categories or [])
            if slots["category"] not in cats:
                cats.append(slots["category"])
            pref.preferred_categories = cats
            
        if slots.get("budget_min") is not None:
            pref.budget_min = slots["budget_min"]
        if slots.get("budget_max") is not None:
            pref.budget_max = slots["budget_max"]
            
        if slots.get("occasion"):
            occs = list(pref.occasions or [])
            if slots["occasion"] not in occs:
                occs.append(slots["occasion"])
            pref.occasions = occs

        if slots.get("collection"):
            styles = list(pref.style_preferences or [])
            if slots["collection"] not in styles:
                styles.append(slots["collection"])
            pref.style_preferences = styles

    @classmethod
    def analyze_message_and_update_state(
        cls, db: Session, session_id: str, user_message: str, history: list, user_id: Optional[str]
    ) -> Tuple[str, dict, bool]:
        """
        Analyzes the incoming message, extracts slot variables, updates state in DB,
        and returns: (active_state, current_slots, purchase_intent_flag)
        """
        state_record = cls.get_or_create_state(db, session_id)
        context = state_record.context_data or {}
        
        # Load existing slots from state context
        existing_slots = context.get("slots", {
            "category": None,
            "budget_min": None,
            "budget_max": None,
            "material": None,
            "occasion": None,
            "collection": None
        })
        
        # Load preferences if user identifier exists
        if user_id:
            pref = cls.get_or_create_user_preferences(db, user_id)
            existing_slots = cls.merge_preferences_to_slots(existing_slots, pref)
            
        # Extract metadata from current message & history
        analysis = cls._extract_metadata(user_message, history)
        
        # Merge newly extracted attributes
        new_slots = analysis.get("extracted_attributes", {})
        updated_slots = dict(existing_slots)
        for key in ["category", "material", "occasion", "collection"]:
            if new_slots.get(key):
                updated_slots[key] = new_slots[key]
        if new_slots.get("budget_min") is not None:
            updated_slots["budget_min"] = new_slots["budget_min"]
        if new_slots.get("budget_max") is not None:
            updated_slots["budget_max"] = new_slots["budget_max"]

        # Parse lead info if any guest provided details
        new_lead = analysis.get("lead_info", {})
        existing_lead = context.get("lead_info", {"name": None, "phone": None})
        if new_lead.get("name"):
            existing_lead["name"] = new_lead["name"]
        if new_lead.get("phone"):
            existing_lead["phone"] = new_lead["phone"]

        # If user provides their name/details, sync the preferences database immediately
        if user_id or existing_lead.get("name"):
            # Use guest_id or session_id if no auth user_id is present
            target_pref_id = user_id or f"guest_{session_id}"
            pref = cls.get_or_create_user_preferences(db, target_pref_id)
            cls.update_user_preferences_from_slots(pref, updated_slots)
            cls.save_user_preferences(db, pref)

        # Detect active state
        detected_state = analysis.get("state", "DISCOVERY")
        
        # State transitions and adjustments
        purchase_intent = analysis.get("purchase_intent", False) or context.get("purchase_intent", False)
        
        # Force LEAD_CAPTURE state if there is strong purchase intent and missing details for guests
        if purchase_intent and not user_id:
            if not existing_lead.get("name") or not existing_lead.get("phone"):
                detected_state = "LEAD_CAPTURE"
        
        # If recommendation is requested, verify if sufficient details exist
        if detected_state in ["RECOMMENDATION", "DISCOVERY"]:
            sufficient, _ = cls.check_sufficient_information(updated_slots)
            if sufficient:
                detected_state = "RECOMMENDATION"
            else:
                # Fall back to discovery state until slots are filled
                detected_state = "DISCOVERY"

        # Save context state changes
        context["slots"] = updated_slots
        context["lead_info"] = existing_lead
        context["purchase_intent"] = purchase_intent
        state_record.state = detected_state
        state_record.context_data = context
        
        cls.save_state(db, state_record)
        
        return detected_state, updated_slots, purchase_intent

    @classmethod
    def check_sufficient_information(cls, slots: dict) -> Tuple[bool, list]:
        """
        Verify if the slot values are sufficient to run a recommendation.
        Returns: (is_sufficient, list_of_missing_critical_attributes)
        """
        missing = []
        category = slots.get("category")
        if not category:
            missing.append("category")
            
        # Must have category + at least one of material, budget, occasion, or collection
        has_secondary = (
            slots.get("material") is not None or 
            slots.get("budget_max") is not None or 
            slots.get("occasion") is not None or 
            slots.get("collection") is not None
        )
        
        if not has_secondary:
            if not slots.get("material"):
                missing.append("material")
            if slots.get("budget_max") is None:
                missing.append("budget")
                
        is_sufficient = bool(category and has_secondary)
        return is_sufficient, missing

    @classmethod
    def generate_targeted_followup(cls, slots: dict) -> str:
        """
        Generates a targeted follow-up question when critical slots are missing.
        """
        category = slots.get("category")
        if not category:
            return "What type of jewelry are you looking for? (Rings, Earrings, or Necklaces?)"
            
        # If category is present but other details are missing
        return (
            f"To help you find the perfect {category.lower()}, could you please share your "
            "preferred budget range or material (such as 18K yellow gold or sterling silver)?"
        )

    @classmethod
    def _extract_metadata(cls, user_message: str, history: list) -> dict:
        """
        Helper extracting slots/intent via Groq or fallback rule-based parser.
        """
        if llm_service.client:
            try:
                return cls._extract_metadata_via_groq(user_message, history)
            except Exception as e:
                logger.error(f"Failed metadata extraction via Groq: {str(e)}. Using fallback.")
                
        return cls._extract_metadata_fallback(user_message)

    @classmethod
    def _extract_metadata_via_groq(cls, user_message: str, history: list) -> dict:
        """
        Uses Groq structured completion to determine intents and extract properties.
        """
        # Keep instruction highly structured and request valid JSON matching schema
        system_content = (
            "You are a state-driven metadata extractor. Analyze the conversation and user message.\n"
            "Respond ONLY with a valid JSON object matching this schema:\n"
            "{\n"
            '  "state": "GREETING" | "DISCOVERY" | "RECOMMENDATION" | "COMPARISON" | "FAQ" | "POLICY" | "LEAD_CAPTURE",\n'
            '  "extracted_attributes": {\n'
            '    "category": "Ring" | "Earrings" | "Necklace" | null,\n'
            '    "budget_min": float | null,\n'
            '    "budget_max": float | null,\n'
            '    "material": "18k-gold" | "sterling-silver" | "platinum-950" | null,\n'
            '    "occasion": string | null,\n'
            '    "collection": "heritage" | "aura" | "nirvana" | null\n'
            "  },\n"
            '  "purchase_intent": boolean,\n'
            '  "lead_info": {\n'
            '    "name": string | null,\n'
            '    "phone": string | null\n'
            "  }\n"
            "}\n\n"
            "Rules:\n"
            "1. State GREETING if greeting. FAQ if asking about support/custom-design/services. POLICY if asking about returns/refunds/delivery.\n"
            "2. State COMPARISON if user is contrasting items or materials.\n"
            "3. State LEAD_CAPTURE if they want to buy/order, checkout, or provided name/phone. Set purchase_intent = true if they show strong checkout intent.\n"
            "4. Otherwise use DISCOVERY or RECOMMENDATION.\n"
            "5. Do not invent preferences. Extract only what is present in history and message."
        )

        messages = [
            {"role": "system", "content": system_content}
        ]
        # Append recent history (limit to last 5 for context token efficiency)
        for h in history[-5:]:
            messages.append({"role": h["role"], "content": h["content"]})
            
        messages.append({"role": "user", "content": user_message})
        
        reply = llm_service.generate_chat_response(messages)
        
        # Clean reply to extract json
        json_match = re.search(r"\{.*\}", reply, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except Exception:
                pass
                
        logger.warning(f"Failed to parse Groq response: {reply}. Using fallback.")
        return cls._extract_metadata_fallback(user_message)

    @classmethod
    def _extract_metadata_fallback(cls, user_message: str) -> dict:
        """
        Rule-based keyword/regex extraction fallback.
        """
        msg_clean = user_message.lower().strip()
        
        # Use existing QueryClassifier for basic type mapping
        query_type = QueryClassifier.classify(user_message)
        
        # Default state
        state = "DISCOVERY"
        if query_type == "GREETING":
            state = "GREETING"
        elif query_type == "POLICY":
            state = "POLICY"
        elif query_type == "FAQ" or query_type == "GENERAL":
            state = "FAQ"
        elif query_type in ["COLLECTION", "MATERIAL", "PRODUCT"]:
            state = "DISCOVERY"
            
        # Check comparison keywords
        if "compare" in msg_clean or "difference" in msg_clean or "vs" in msg_clean or "better than" in msg_clean:
            state = "COMPARISON"
            
        # Detect slots
        category = None
        if "earring" in msg_clean or "stud" in msg_clean:
            category = "Earrings"
        elif "ring" in msg_clean or "band" in msg_clean:
            category = "Ring"
        elif "necklace" in msg_clean or "chain" in msg_clean or "pendant" in msg_clean:
            category = "Necklace"
            
        material = None
        if "gold" in msg_clean or "18k" in msg_clean or "22k" in msg_clean:
            material = "18k-gold"
        elif "silver" in msg_clean or "925" in msg_clean:
            material = "sterling-silver"
        elif "platinum" in msg_clean or "pt950" in msg_clean:
            material = "platinum-950"
            
        collection = None
        if "heritage" in msg_clean:
            collection = "heritage"
        elif "aura" in msg_clean:
            collection = "aura"
        elif "nirvana" in msg_clean:
            collection = "nirvana"
            
        occasion = None
        for occ in ["wedding", "bridal", "daily", "anniversary", "engagement"]:
            if occ in msg_clean:
                occasion = occ
                break
                
        # Budget matching
        budget_min, budget_max = None, None
        budget_nums = re.findall(r"\$?\b(\d{3,5})\b", msg_clean)
        if budget_nums:
            nums = [float(x) for x in budget_nums]
            if "under" in msg_clean or "less than" in msg_clean or "below" in msg_clean:
                budget_max = nums[0]
            elif "above" in msg_clean or "more than" in msg_clean or "over" in msg_clean:
                budget_min = nums[0]
            elif len(nums) >= 2:
                budget_min, budget_max = sorted([nums[0], nums[1]])
            else:
                budget_max = nums[0] # assume upper bound by default

        # Purchase intent
        purchase_intent = False
        buy_keywords = ["buy", "purchase", "order", "checkout", "add to cart", "get this"]
        if any(kw in msg_clean for kw in buy_keywords):
            purchase_intent = True
            state = "LEAD_CAPTURE"

        # Capture Guest Name & Phone fallback
        name, phone = None, None
        phone_match = re.search(r"\b\d{10,12}\b", msg_clean)
        if phone_match:
            phone = phone_match.group(0)
            
        # Extract name if they explicitly introduced themselves (e.g. "my name is Vicky" or "i am Vicky")
        name_match = re.search(r"(?:my name is|i am|call me)\s+([a-z]+)", msg_clean)
        if name_match:
            name = name_match.group(1).capitalize()
        elif phone_match:
            # Fallback: take first word if simple and phone is present
            words = user_message.split()
            if len(words) > 0:
                first_word = words[0].strip(",.!?;:")
                if first_word.isalpha() and first_word.lower() not in ["hi", "hello", "my", "i", "here"]:
                    name = first_word.capitalize()
                    
        if phone:
            state = "LEAD_CAPTURE"

        return {
            "state": state,
            "extracted_attributes": {
                "category": category,
                "budget_min": budget_min,
                "budget_max": budget_max,
                "material": material,
                "occasion": occasion,
                "collection": collection
            },
            "purchase_intent": purchase_intent,
            "lead_info": {
                "name": name,
                "phone": phone
            }
        }
