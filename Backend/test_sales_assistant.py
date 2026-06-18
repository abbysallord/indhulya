import unittest
import os
import json
from unittest.mock import patch, MagicMock

# Configure environment keys before importing backend components
os.environ["GROQ_API_KEY"] = "mock-key"

from app.services.state_service import StateService
from app.services.recommendation_service import RecommendationService
from app.services.lead_service import LeadService
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRequest

class TestSalesAssistant(unittest.TestCase):
    def setUp(self):
        # Mocks setup
        pass
        
    def tearDown(self):
        pass

    @patch("app.db.queries.get_conversation_state")
    @patch("app.db.queries.save_conversation_state")
    def test_state_creation_and_retrieval(self, mock_save, mock_get):
        """
        Verify that ConversationState is correctly initialized in the DB.
        """
        session_id = "test-session-123"
        mock_get.return_value = None
        mock_save.return_value = True
        
        state_rec = StateService.get_or_create_state(session_id)
        
        self.assertEqual(state_rec["session_id"], session_id)
        self.assertEqual(state_rec["state"], "GREETING")
        self.assertIsNotNone(state_rec["context_data"])
        self.assertIn("slots", state_rec["context_data"])
        
        mock_get.assert_called_once_with(session_id)
        mock_save.assert_called_once()

    def test_slot_extraction_fallback(self):
        """
        Test keyword-based slot extraction fallback logic.
        """
        msg = "I'm looking for a gold ring under $600 for a wedding"
        analysis = StateService._extract_metadata_fallback(msg)
        
        slots = analysis["extracted_attributes"]
        self.assertEqual(slots["category"], "Ring")
        self.assertEqual(slots["material"], "18k-gold")
        self.assertEqual(slots["budget_max"], 600.0)
        self.assertEqual(slots["occasion"], "wedding")
        
    def test_missing_information_detection(self):
        """
        Verify that suggestions are blocked and follow-up is prompted when critical slots are missing.
        """
        # Scenario 1: Category is missing
        slots_no_category = {
            "category": None,
            "material": "18k-gold",
            "budget_max": 500
        }
        sufficient, missing = StateService.check_sufficient_information(slots_no_category)
        self.assertFalse(sufficient)
        self.assertIn("category", missing)
        
        followup = StateService.generate_targeted_followup(slots_no_category)
        self.assertIn("Rings, Earrings, or Necklaces", followup)

        # Scenario 2: Category present, but no secondary attributes
        slots_only_category = {
            "category": "Ring",
            "material": None,
            "budget_min": None,
            "budget_max": None,
            "occasion": None,
            "collection": None
        }
        sufficient2, missing2 = StateService.check_sufficient_information(slots_only_category)
        self.assertFalse(sufficient2)
        self.assertIn("material", missing2)
        self.assertIn("budget", missing2)
        
        followup2 = StateService.generate_targeted_followup(slots_only_category)
        self.assertIn("budget range or material", followup2)

        # Scenario 3: Sufficient information (Category + Material)
        slots_sufficient = {
            "category": "Ring",
            "material": "sterling-silver",
            "budget_max": None
        }
        sufficient3, missing3 = StateService.check_sufficient_information(slots_sufficient)
        self.assertTrue(sufficient3)
        self.assertEqual(len(missing3), 0)

    def test_user_preference_memory_auth(self):
        """
        Verify database preference loading, saving, and merging for authenticated users.
        """
        # Test merging preferences into empty slot parameters
        pref = {
            "user_id": "auth-user-789",
            "preferred_materials": ["platinum-950"],
            "preferred_categories": ["Necklace"],
            "budget_max": 1500.0,
            "budget_min": None,
            "occasions": [],
            "style_preferences": []
        }
        slots = {
            "category": None,
            "material": None,
            "budget_max": None
        }
        merged = StateService.merge_preferences_to_slots(slots, pref)
        self.assertEqual(merged["category"], "Necklace")
        self.assertEqual(merged["material"], "platinum-950")
        self.assertEqual(merged["budget_max"], 1500.0)

        # Test updating preferences from slots
        new_slots = {
            "category": "Ring",
            "material": "18k-gold"
        }
        StateService.update_user_preferences_from_slots(pref, new_slots)
        self.assertIn("Ring", pref["preferred_categories"])
        self.assertIn("18k-gold", pref["preferred_materials"])

    def test_user_preference_memory_guest(self):
        """
        Verify preferences are analyzed statelessly for guest users.
        """
        session_id = "guest-session-abc"
        
        # Analyze user message containing guest name and preference (stateless)
        active_state, current_slots, _, lead_info = StateService.analyze_message_and_update_state(
            session_id=session_id,
            user_message="My name is Vicky and I like silver earrings",
            history=[],
            user_id=None
        )
        
        self.assertEqual(current_slots["category"], "Earrings")
        self.assertEqual(current_slots["material"], "sterling-silver")
        self.assertEqual(lead_info["name"], "Vicky")

    def test_deterministic_product_scoring(self):
        """
        Verify deterministic recommendation scoring rules and rankings.
        """
        slots = {
            "category": "Ring",
            "material": "18k-gold",
            "budget_max": 550.0,
            "collection": "aura"
        }
        
        ranked = RecommendationService.score_and_rank_products(slots)
        
        # Verify category hard-filter (only Rings are kept, necklaces and earrings rejected)
        for item in ranked:
            self.assertEqual(item["product"]["category"], "Ring")
            
        # Verify scoring logic on top matches (e.g., Aura Minimalist Ring is a Ring, 18K Gold, < $550, Aura collection)
        top_product = ranked[0]["product"]
        self.assertEqual(top_product["id"], "aura-minimalist-band")
        
        # Category Match (10) + Material Match (5) + Budget Match (5) + Collection Match (4) = 24 points
        self.assertEqual(ranked[0]["score"], 24)
        self.assertIn("category", ranked[0]["matches"])
        self.assertIn("material", ranked[0]["matches"])
        self.assertIn("budget", ranked[0]["matches"])
        self.assertIn("collection", ranked[0]["matches"])

    @patch("app.db.queries.save_recommendation_history")
    def test_recommendation_history_logging(self, mock_save):
        """
        Verify recommendations are correctly traced in Supabase for authenticated users.
        """
        session_id = "session-rec-trace"
        user_id = "user-rec-trace"
        query = "gold ring under 1000"
        
        slots = {"category": "Ring", "material": "18k-gold", "budget_max": 1000.0}
        ranked = RecommendationService.score_and_rank_products(slots)
        
        RecommendationService.save_recommendation_history(
            session_id=session_id,
            user_id=user_id,
            query=query,
            scored_products=ranked
        )
        
        mock_save.assert_called_once()

    @patch("app.db.queries.create_lead")
    def test_lead_capture_authenticated(self, mock_create):
        """
        Verify authenticated leads are saved automatically.
        """
        user_id = "auth-lead-1"
        email = "vicky@indhulya.com"
        metadata = {"full_name": "Vicky Indhulya", "phone": "+919876543210"}
        session_id = "auth-sess-lead"
        
        mock_create.return_value = {"id": "lead-uuid"}
        
        lead = LeadService.create_lead_record(
            user_id=user_id,
            session_id=session_id,
            name="Vicky Indhulya",
            phone="+919876543210",
            email=email,
            slots={"category": "Ring", "material": "18k-gold"},
            history=[],
            current_message="I want to buy a gold ring",
            assistant_reply="processing..."
        )
        
        self.assertIsNotNone(lead)
        mock_create.assert_called_once()

    @patch("app.db.queries.create_lead")
    def test_lead_capture_guest(self, mock_create):
        """
        Verify guest leads are requested and saved properly.
        """
        session_id = "guest-lead-sess"
        mock_create.return_value = {"id": "guest-lead-uuid"}
        
        lead = LeadService.create_lead_record(
            user_id=None,
            session_id=session_id,
            name="Vicky",
            phone="1234567890",
            email=None,
            slots={"category": "Ring"},
            history=[],
            current_message="Vicky, 1234567890",
            assistant_reply="thank you"
        )
        self.assertIsNotNone(lead)
        mock_create.assert_called_once()

    @patch('app.services.conversation_orchestrator.llm_service')
    @patch('app.db.queries.create_lead')
    def test_sales_assistant_chat_orchestration_flow(self, mock_create, mock_llm):
        """
        Integration test verifying ChatService stateless guest flows:
        GREETING -> DISCOVERY (Missing details) -> RECOMMENDATION (Score & explain) -> LEAD_CAPTURE
        """
        mock_llm.generate_chat_response.return_value = "Mocked LLM reply"
        mock_create.return_value = {"id": "lead-uuid"}
        
        # 1. User says hi (GREETING)
        req1 = ChatRequest(message="Hello", session_id=None)
        res1 = ChatService.process_chat(req1, user_id=None)
        
        session_id = res1.session_id
        self.assertIsNotNone(session_id)
        
        # 2. User asks for rings (DISCOVERY - missing details)
        history = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": res1.response}
        ]
        req2 = ChatRequest(message="Show me some rings", session_id=session_id, history=history)
        res2 = ChatService.process_chat(req2, user_id=None)
        
        # Assert follow-up question asks for missing slots (budget/material)
        self.assertIn("budget range or material", res2.response)

        # 3. User provides details (RECOMMENDATION)
        history.extend([
            {"role": "user", "content": "Show me some rings"},
            {"role": "assistant", "content": res2.response}
        ])
        req3 = ChatRequest(message="I prefer gold rings under $800", session_id=session_id, history=history)
        res3 = ChatService.process_chat(req3, user_id=None)
        
        # 4. User wishes to purchase (LEAD_CAPTURE for guests)
        history.extend([
            {"role": "user", "content": "I prefer gold rings under $800"},
            {"role": "assistant", "content": res3.response}
        ])
        req4 = ChatRequest(message="I want to buy the Aura Minimalist Ring", session_id=session_id, history=history)
        res4 = ChatService.process_chat(req4, user_id=None)
        
        self.assertIn("share your name and phone number", res4.response)
        
        # 5. User provides lead details
        history.extend([
            {"role": "user", "content": "I want to buy the Aura Minimalist Ring"},
            {"role": "assistant", "content": res4.response}
        ])
        req5 = ChatRequest(message="Vicky, 9876543210", session_id=session_id, history=history)
        res5 = ChatService.process_chat(req5, user_id=None)
        
        self.assertIn("registered", res5.response)
        mock_create.assert_called_once()
 
    @patch('app.services.conversation_orchestrator.llm_service')
    def test_sales_assistant_lead_breakout_flow(self, mock_llm):
        """
        Verify that a guest who is prompted for lead capture can break out of it by asking a new general query.
        """
        mock_llm.generate_chat_response.return_value = "Mocked LLM reply"
        
        # 1. Start session and trigger lead capture
        req1 = ChatRequest(message="I want to buy a gold ring", session_id=None)
        res1 = ChatService.process_chat(req1, user_id=None)
        session_id = res1.session_id
        
        # 2. Write unrelated message like "die here" (which is GENERAL/FAQ) and assert breakout
        history = [
            {"role": "user", "content": "I want to buy a gold ring"},
            {"role": "assistant", "content": res1.response}
        ]
        req2 = ChatRequest(message="die here", session_id=session_id, history=history)
        res2 = ChatService.process_chat(req2, user_id=None)
        
        # Should not prompt for name/phone again since it classified as FAQ
        self.assertNotIn("share your name and phone number", res2.response)

if __name__ == '__main__':
    unittest.main()

