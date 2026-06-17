import unittest
import os
import json
from unittest.mock import patch, MagicMock

# Configure environment keys before importing backend components
os.environ["GROQ_API_KEY"] = "mock-key"

from app.db.database import SessionLocal, Base, engine
from app.db.models import ConversationState, UserPreference, Lead, RecommendationHistory
from app.services.state_service import StateService
from app.services.recommendation_service import RecommendationService
from app.services.lead_service import LeadService
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRequest

class TestSalesAssistant(unittest.TestCase):
    def setUp(self):
        # Create database tables for the test session
        Base.metadata.create_all(bind=engine)
        self.db = SessionLocal()
        
    def tearDown(self):
        self.db.close()
        # Drop tables to ensure clean slate for subsequent test runs
        Base.metadata.drop_all(bind=engine)

    def test_state_creation_and_retrieval(self):
        """
        Verify that ConversationState is correctly initialized in the DB.
        """
        session_id = "test-session-123"
        state_rec = StateService.get_or_create_state(self.db, session_id)
        
        self.assertEqual(state_rec.session_id, session_id)
        self.assertEqual(state_rec.state, "GREETING")
        self.assertIsNotNone(state_rec.context_data)
        self.assertIn("slots", state_rec.context_data)
        
        # Verify it persisted in DB
        db_rec = self.db.query(ConversationState).filter(ConversationState.session_id == session_id).first()
        self.assertIsNotNone(db_rec)
        self.assertEqual(db_rec.state, "GREETING")

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
        user_id = "auth-user-789"
        
        # Pre-populate some historical preferences
        pref = StateService.get_or_create_user_preferences(self.db, user_id)
        pref.preferred_materials = ["platinum-950"]
        pref.preferred_categories = ["Necklace"]
        pref.budget_max = 1500.0
        StateService.save_user_preferences(self.db, pref)
        
        # Test merging preferences into empty slot parameters
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
        StateService.save_user_preferences(self.db, pref)
        
        updated_pref = StateService.get_or_create_user_preferences(self.db, user_id)
        self.assertIn("Ring", updated_pref.preferred_categories)
        self.assertIn("18k-gold", updated_pref.preferred_materials)

    def test_user_preference_memory_guest(self):
        """
        Verify preferences are saved under guest user ID when they provide details.
        """
        session_id = "guest-session-abc"
        
        # Analyze user message containing guest name and preference
        active_state, current_slots, _ = StateService.analyze_message_and_update_state(
            db=self.db,
            session_id=session_id,
            user_message="My name is Vicky and I like silver earrings",
            history=[],
            user_id=None
        )
        
        self.assertEqual(current_slots["category"], "Earrings")
        self.assertEqual(current_slots["material"], "sterling-silver")
        
        # Assert preferences were saved to DB under the guest identifier
        pref = self.db.query(UserPreference).filter(UserPreference.user_id == f"guest_{session_id}").first()
        self.assertIsNotNone(pref)
        self.assertIn("sterling-silver", pref.preferred_materials)
        self.assertIn("Earrings", pref.preferred_categories)

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

    def test_recommendation_history_logging(self):
        """
        Verify recommendations are correctly traced in the database.
        """
        session_id = "session-rec-trace"
        user_id = "user-rec-trace"
        query = "gold ring under 1000"
        
        slots = {"category": "Ring", "material": "18k-gold", "budget_max": 1000.0}
        ranked = RecommendationService.score_and_rank_products(slots)
        
        RecommendationService.save_recommendation_history(
            db=self.db,
            session_id=session_id,
            user_id=user_id,
            query=query,
            scored_products=ranked
        )
        
        rec_trace = self.db.query(RecommendationHistory).filter(RecommendationHistory.session_id == session_id).first()
        self.assertIsNotNone(rec_trace)
        self.assertEqual(rec_trace.user_id, user_id)
        self.assertEqual(rec_trace.query, query)
        self.assertIn("aura-minimalist-band", rec_trace.recommended_products)
        self.assertIn("aura-minimalist-band", rec_trace.scores)

    def test_lead_capture_authenticated(self):
        """
        Verify authenticated leads are saved automatically.
        """
        user_id = "auth-lead-1"
        email = "vicky@indhulya.com"
        metadata = {"full_name": "Vicky Indhulya", "phone": "+919876543210"}
        session_id = "auth-sess-lead"
        
        lead = LeadService.create_authenticated_lead(self.db, user_id, email, metadata, session_id)
        
        self.assertIsNotNone(lead)
        self.assertEqual(lead.name, "Vicky Indhulya")
        self.assertEqual(lead.email, email)
        self.assertEqual(lead.phone, "+919876543210")
        
        # Verify persisted in DB
        db_lead = self.db.query(Lead).filter(Lead.session_id == session_id).first()
        self.assertIsNotNone(db_lead)
        self.assertEqual(db_lead.user_id, user_id)

    def test_lead_capture_guest(self):
        """
        Verify guest leads are requested and saved properly.
        """
        session_id = "guest-lead-sess"
        
        # Capture contact details
        lead = LeadService.create_guest_lead(self.db, session_id, name="Vicky", phone="1234567890")
        self.assertIsNotNone(lead)
        self.assertEqual(lead.name, "Vicky")
        self.assertEqual(lead.phone, "1234567890")
        self.assertIsNone(lead.user_id) # guest is None
        
        db_lead = self.db.query(Lead).filter(Lead.session_id == session_id).first()
        self.assertIsNotNone(db_lead)
        self.assertEqual(db_lead.name, "Vicky")

    @patch('app.services.chat_service.llm_service')
    def test_sales_assistant_chat_orchestration_flow(self, mock_llm):
        """
        Integration test verifying ChatService flows:
        GREETING -> DISCOVERY (Missing details) -> RECOMMENDATION (Score & explain) -> LEAD_CAPTURE
        """
        mock_llm.generate_chat_response.return_value = "Mocked LLM reply"
        # 1. User says hi (GREETING)
        req1 = ChatRequest(message="Hello", session_id=None)
        res1 = ChatService.process_chat(req1, user_id=None)
        self.db.expire_all()
        
        session_id = res1.session_id
        self.assertIsNotNone(session_id)
        
        state_rec = self.db.query(ConversationState).filter(ConversationState.session_id == session_id).first()
        self.assertEqual(state_rec.state, "GREETING")

        # 2. User asks for rings (DISCOVERY - missing details)
        req2 = ChatRequest(message="Show me some rings", session_id=session_id)
        res2 = ChatService.process_chat(req2, user_id=None)
        self.db.expire_all()
        
        state_rec2 = self.db.query(ConversationState).filter(ConversationState.session_id == session_id).first()
        self.assertEqual(state_rec2.state, "DISCOVERY")
        # Assert follow-up question asks for missing slots (budget/material)
        self.assertIn("budget range or material", res2.response)

        # 3. User provides details (RECOMMENDATION)
        req3 = ChatRequest(message="I prefer gold rings under $800", session_id=session_id)
        res3 = ChatService.process_chat(req3, user_id=None)
        self.db.expire_all()
        
        state_rec3 = self.db.query(ConversationState).filter(ConversationState.session_id == session_id).first()
        self.assertEqual(state_rec3.state, "RECOMMENDATION")
        self.assertEqual(state_rec3.context_data["slots"]["category"], "Ring")
        self.assertEqual(state_rec3.context_data["slots"]["material"], "18k-gold")
        self.assertEqual(state_rec3.context_data["slots"]["budget_max"], 800.0)

        # 4. User wishes to purchase (LEAD_CAPTURE for guests)
        req4 = ChatRequest(message="I want to buy the Aura Minimalist Ring", session_id=session_id)
        res4 = ChatService.process_chat(req4, user_id=None)
        self.db.expire_all()
        
        state_rec4 = self.db.query(ConversationState).filter(ConversationState.session_id == session_id).first()
        self.assertEqual(state_rec4.state, "LEAD_CAPTURE")
        self.assertIn("share your name and phone number", res4.response)
        
        # 5. User provides lead details
        req5 = ChatRequest(message="Vicky, 9876543210", session_id=session_id)
        res5 = ChatService.process_chat(req5, user_id=None)
        self.db.expire_all()
        
        state_rec5 = self.db.query(ConversationState).filter(ConversationState.session_id == session_id).first()
        self.assertEqual(state_rec5.state, "LEAD_CAPTURE")
        self.assertIn("Thank you Vicky! Your contact number 9876543210 has been registered", res5.response)
        
        # Check database lead
        guest_lead = self.db.query(Lead).filter(Lead.session_id == session_id).first()
        self.assertIsNotNone(guest_lead)
        self.assertEqual(guest_lead.name, "Vicky")
        self.assertEqual(guest_lead.phone, "9876543210")

if __name__ == '__main__':
    unittest.main()
