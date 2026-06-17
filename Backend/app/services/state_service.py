import json
import re
from typing import Dict, Any, Optional, Tuple
from app.db import queries
from app.core.config import logger
from app.services.llm_service import llm_service
from app.services.rag.classifier import QueryClassifier

class StateService:
    @staticmethod
    def get_or_create_state(session_id: str) -> dict:
        """
        Retrieves or creates a ConversationState record in the DB.
        """
        state_record = queries.get_conversation_state(session_id)
        if not state_record:
            state_record = {
                "session_id": session_id,
                "state": "GREETING",
                "context_data": {
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
            }
            queries.save_conversation_state(session_id, "GREETING", state_record["context_data"])
        return state_record

    @staticmethod
    def save_state(state_record: dict):
        """
        Commits conversation state changes to the database.
        """
        queries.save_conversation_state(state_record["session_id"], state_record["state"], state_record["context_data"])

    @staticmethod
    def get_or_create_user_preferences(user_id: str) -> dict:
        """
        Retrieves or creates a UserPreference record in the DB.
        """
        pref = queries.get_user_preferences(user_id)
        if not pref:
            pref = {
                "user_id": user_id,
                "preferred_materials": [],
                "preferred_categories": [],
                "budget_min": None,
                "budget_max": None,
                "occasions": [],
                "style_preferences": []
            }
            queries.save_user_preferences(user_id, pref)
        return pref

    @staticmethod
    def save_user_preferences(pref: dict):
        """
        Commits user preferences changes to the database.
        """
        queries.save_user_preferences(pref["user_id"], pref)

    @classmethod
    def merge_preferences_to_slots(cls, slots: dict, pref: dict) -> dict:
        """
        Fills missing slot attributes from stored database preferences.
        """
        updated_slots = dict(slots)
        
        pref_categories = pref.get("preferred_categories", [])
        if not updated_slots.get("category") and pref_categories:
            updated_slots["category"] = pref_categories[-1]
            
        pref_materials = pref.get("preferred_materials", [])
        if not updated_slots.get("material") and pref_materials:
            updated_slots["material"] = pref_materials[-1]
            
        pref_budget_min = pref.get("budget_min")
        pref_budget_max = pref.get("budget_max")
        if updated_slots.get("budget_min") is None and pref_budget_min is not None:
            updated_slots["budget_min"] = pref_budget_min
        if updated_slots.get("budget_max") is None and pref_budget_max is not None:
            updated_slots["budget_max"] = pref_budget_max
            
        pref_occasions = pref.get("occasions", [])
        if not updated_slots.get("occasion") and pref_occasions:
            updated_slots["occasion"] = pref_occasions[-1]
            
        pref_styles = pref.get("style_preferences", [])
        if not updated_slots.get("collection") and pref_styles:
            for style in pref_styles:
                if style.lower() in ["heritage", "aura", "nirvana"]:
                    updated_slots["collection"] = style.lower()
                    break
                    
        return updated_slots

    @classmethod
    def update_user_preferences_from_slots(cls, pref: dict, slots: dict):
        """
        Updates the persistent UserPreference record with newly extracted slots.
        """
        if slots.get("material"):
            mats = list(pref.get("preferred_materials", []) or [])
            if slots["material"] not in mats:
                mats.append(slots["material"])
            pref["preferred_materials"] = mats
            
        if slots.get("category"):
            cats = list(pref.get("preferred_categories", []) or [])
            if slots["category"] not in cats:
                cats.append(slots["category"])
            pref["preferred_categories"] = cats
            
        if slots.get("budget_min") is not None:
            pref["budget_min"] = slots["budget_min"]
        if slots.get("budget_max") is not None:
            pref["budget_max"] = slots["budget_max"]
            
        if slots.get("occasion"):
            occs = list(pref.get("occasions", []) or [])
            if slots["occasion"] not in occs:
                occs.append(slots["occasion"])
            pref["occasions"] = occs

        if slots.get("collection"):
            styles = list(pref.get("style_preferences", []) or [])
            if slots["collection"] not in styles:
                styles.append(slots["collection"])
            pref["style_preferences"] = styles

    @classmethod
    def analyze_message_and_update_state(
        cls, session_id: str, user_message: str, history: list, user_id: Optional[str]
    ) -> Tuple[str, dict, bool, dict]:
        """
        Analyzes the incoming message, extracts slot variables, updates state in DB,
        and returns: (active_state, current_slots, purchase_intent_flag, lead_info)
        """
        is_guest = (user_id is None)

        if not is_guest:
            state_record = cls.get_or_create_state(session_id)
            context = state_record.get("context_data", {})
        else:
            # Guest user: build a temporary, stateless context from scratch
            context = {
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
        if not is_guest:
            pref = cls.get_or_create_user_preferences(user_id)
            existing_slots = cls.merge_preferences_to_slots(existing_slots, pref)
            
        # Extract metadata from current message & history
        formatted_history = []
        for h in (history or []):
            if hasattr(h, "role"):
                formatted_history.append({"role": h.role, "content": h.content})
            elif isinstance(h, dict):
                formatted_history.append(h)
                
        analysis = cls._extract_metadata(user_message, formatted_history)
        
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

        # Parse lead info if any details are provided
        new_lead = analysis.get("lead_info", {})
        existing_lead = context.get("lead_info", {"name": None, "phone": None})
        if new_lead.get("name"):
            existing_lead["name"] = new_lead["name"]
        if new_lead.get("phone"):
            existing_lead["phone"] = new_lead["phone"]

        # If user provides their details, sync the preferences database immediately (auth users only)
        if not is_guest:
            pref = cls.get_or_create_user_preferences(user_id)
            cls.update_user_preferences_from_slots(pref, updated_slots)
            cls.save_user_preferences(pref)

        # Detect active state
        detected_state = analysis.get("state", "DISCOVERY")
        current_msg_state = analysis.get("state", "DISCOVERY")
        
        # Reset purchase intent lock if the user switches topics to greeting, FAQs, policies, 
        # comparisons, or queries new products without active checkout intent or details.
        is_providing_details = bool(existing_lead.get("name") or existing_lead.get("phone"))
        has_active_purchase_intent = analysis.get("purchase_intent", False)
        
        if current_msg_state in ["GREETING", "FAQ", "POLICY", "COMPARISON"] or (
            current_msg_state == "DISCOVERY" and not has_active_purchase_intent and not is_providing_details
        ):
            context["purchase_intent"] = False
            purchase_intent = False
            detected_state = current_msg_state
        else:
            purchase_intent = has_active_purchase_intent or context.get("purchase_intent", False)
        
        # Force LEAD_CAPTURE state if there is strong purchase intent and missing details for guests
        if purchase_intent and is_guest:
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
        
        if not is_guest:
            state_record["state"] = detected_state
            state_record["context_data"] = context
            cls.save_state(state_record)
        
        return detected_state, updated_slots, purchase_intent, existing_lead

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
                
        return cls._extract_metadata_fallback(user_message, history)

    @classmethod
    def _extract_metadata_via_groq(cls, user_message: str, history: list) -> dict:
        """
        Uses Groq structured completion to determine intents and extract properties.
        """
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
            "3. Set purchase_intent = true if they show strong buying/checkout intent. Buying intent includes price/cost inquiries ('how much is this?'), budget discussions, product comparisons, store visit requests, customization/personalization requests, contact/callback requests, or general purchase-related language (e.g. 'I want to buy this'). If purchase_intent is true, state should be LEAD_CAPTURE.\n"
            "4. Otherwise use DISCOVERY or RECOMMENDATION.\n"
            "5. Do not invent preferences. Extract only what is present in history and message."
        )

        messages = [
            {"role": "system", "content": system_content}
        ]
        # Append recent history (limit to last 10 for context token efficiency)
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})
            
        messages.append({"role": "user", "content": user_message})
        
        reply = llm_service.generate_chat_response(messages)
        
        json_match = re.search(r"\{.*\}", reply, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except Exception:
                pass
                
        logger.warning(f"Failed to parse Groq response: {reply}. Using fallback.")
        return cls._extract_metadata_fallback(user_message, history)

    @classmethod
    def _extract_metadata_fallback(cls, user_message: str, history: list = None) -> dict:
        """
        Rule-based keyword/regex extraction fallback. Reconstructs state from history + current message.
        """
        accumulated_slots = {
            "category": None,
            "budget_min": None,
            "budget_max": None,
            "material": None,
            "occasion": None,
            "collection": None
        }
        accumulated_lead = {
            "name": None,
            "phone": None
        }
        
        # 1. Accumulate slots and lead info from history + current message
        turns = []
        if history:
            for h in history:
                if h.get("role") == "user":
                    turns.append(h.get("content", ""))
        turns.append(user_message)
        
        for t in turns:
            msg_clean = t.lower().strip()
            
            # Category
            if "earring" in msg_clean or "stud" in msg_clean:
                accumulated_slots["category"] = "Earrings"
            elif "ring" in msg_clean or "band" in msg_clean:
                accumulated_slots["category"] = "Ring"
            elif "necklace" in msg_clean or "chain" in msg_clean or "pendant" in msg_clean:
                accumulated_slots["category"] = "Necklace"
                
            # Material
            if "gold" in msg_clean or "18k" in msg_clean or "22k" in msg_clean:
                accumulated_slots["material"] = "18k-gold"
            elif "silver" in msg_clean or "925" in msg_clean:
                accumulated_slots["material"] = "sterling-silver"
            elif "platinum" in msg_clean or "pt950" in msg_clean:
                accumulated_slots["material"] = "platinum-950"
                
            # Collection
            if "heritage" in msg_clean:
                accumulated_slots["collection"] = "heritage"
            elif "aura" in msg_clean:
                accumulated_slots["collection"] = "aura"
            elif "nirvana" in msg_clean:
                accumulated_slots["collection"] = "nirvana"
                
            # Occasion
            for occ in ["wedding", "bridal", "daily", "anniversary", "engagement"]:
                if occ in msg_clean:
                    accumulated_slots["occasion"] = occ
                    break
                    
            # Budget
            budget_nums = re.findall(r"\$?\b(\d{3,5})\b", msg_clean)
            if budget_nums:
                nums = [float(x) for x in budget_nums]
                if "under" in msg_clean or "less than" in msg_clean or "below" in msg_clean:
                    accumulated_slots["budget_max"] = nums[0]
                elif "above" in msg_clean or "more than" in msg_clean or "over" in msg_clean:
                    accumulated_slots["budget_min"] = nums[0]
                elif len(nums) >= 2:
                    accumulated_slots["budget_min"], accumulated_slots["budget_max"] = sorted([nums[0], nums[1]])
                else:
                    accumulated_slots["budget_max"] = nums[0]

            # Lead Name & Phone
            phone_match = re.search(r"\b\d{10,12}\b", msg_clean)
            if phone_match:
                accumulated_lead["phone"] = phone_match.group(0)
                
            name_match = re.search(r"(?:my name is|i am|call me)\s+([a-z]+)", msg_clean)
            if name_match:
                accumulated_lead["name"] = name_match.group(1).capitalize()
            elif phone_match:
                words = t.split()
                if len(words) > 0:
                    first_word = words[0].strip(",.!?;:")
                    if first_word.isalpha() and first_word.lower() not in ["hi", "hello", "my", "i", "here"]:
                        accumulated_lead["name"] = first_word.capitalize()
                        
        # 2. Extract purchase intent and state ONLY from the current user_message
        msg_last_clean = user_message.lower().strip()
        query_type = QueryClassifier.classify(user_message)
        
        state = "DISCOVERY"
        if query_type == "GREETING":
            state = "GREETING"
        elif query_type == "POLICY":
            state = "POLICY"
        elif query_type in ["FAQ", "GENERAL"]:
            state = "FAQ"
        elif any(kw in msg_last_clean for kw in ["compare", "vs", "difference", "better than"]):
            state = "COMPARISON"
            
        purchase_intent = False
        buy_keywords = [
            "buy", "purchase", "order", "checkout", "add to cart", "get this", "want this",
            "price", "cost", "how much", "rate", "price range",
            "custom", "customize", "customization", "personalize", "made to order",
            "contact", "call", "phone", "email", "callback", "reach out",
            "visit", "store", "location", "address", "where is", "physical store"
        ]
        
        if any(kw in msg_last_clean for kw in buy_keywords):
            purchase_intent = True
            state = "LEAD_CAPTURE"
            
        compare_keywords = ["compare", "vs", "difference", "better than", "contrast"]
        if any(kw in msg_last_clean for kw in compare_keywords):
            purchase_intent = True
            state = "LEAD_CAPTURE"
            
        return {
            "state": state,
            "extracted_attributes": accumulated_slots,
            "purchase_intent": purchase_intent,
            "lead_info": accumulated_lead
        }
