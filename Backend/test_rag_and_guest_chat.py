import unittest
from unittest.mock import patch
from fastapi import HTTPException

# Setup mock env key
import os
os.environ["GROQ_API_KEY"] = "mock-key"

from app.services.rag.rag_service import rag_service
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRequest
from app.services.guest_session_store import GUEST_SESSIONS, get_guest_session
from app.services.prompt_builder import PromptBuilder

class TestRAGAndGuestChat(unittest.TestCase):
    def test_retriever_exact_matches(self):
        """
        Verify that TF-IDF search retrieves the correct documents for specific keyword queries.
        """
        # Test product matching
        context_gold = rag_service.get_context("gold ring")
        self.assertIn("Aura Minimalist Ring", context_gold)
        self.assertIn("18K Yellow Gold", context_gold) # linked material name check
        
        # Test collection matching
        context_heritage = rag_service.get_context("Heritage collection")
        self.assertIn("Heritage Collection", context_heritage)
        
        # Test FAQ matching
        context_return = rag_service.get_context("return policy")
        self.assertIn("30-day return policy", context_return)

    def test_retriever_no_match(self):
        """
        Verify that search queries for out-of-catalog items return empty context.
        """
        context_unrelated = rag_service.get_context("spaceships and laser swords")
        self.assertEqual(context_unrelated, "")

    @patch('app.services.chat_service.llm_service')
    def test_guest_session_chat_flow(self, mock_llm):
        """
        Verify the guest session creation, message storage, and reply generation flow.
        """
        mock_llm.generate_chat_response.return_value = "This is a mock reply about the Aura ring."
        
        # 1. Start a new guest session
        request = ChatRequest(message="Tell me about the Aura ring", session_id=None)
        response = ChatService.process_chat(request, user_id=None)
        
        guest_session_id = response.session_id
        self.assertIsNotNone(guest_session_id)
        self.assertEqual(response.response, "This is a mock reply about the Aura ring.")
        
        # Verify the session and message persistence in the guest store
        session_data = get_guest_session(guest_session_id)
        self.assertIsNotNone(session_data)
        self.assertEqual(len(session_data["messages"]), 2) # 1 user, 1 assistant
        self.assertEqual(session_data["messages"][0]["role"], "user")
        self.assertEqual(session_data["messages"][0]["content"], "Tell me about the Aura ring")
        self.assertEqual(session_data["messages"][1]["role"], "assistant")
        self.assertEqual(session_data["messages"][1]["content"], "This is a mock reply about the Aura ring.")

        # 2. Continue the guest conversation
        request_followup = ChatRequest(message="What is its price?", session_id=guest_session_id)
        response_followup = ChatService.process_chat(request_followup, user_id=None)
        
        self.assertEqual(response_followup.session_id, guest_session_id)
        self.assertEqual(len(session_data["messages"]), 4) # 2 user, 2 assistant

    def test_prompt_builder_grounding_inclusion(self):
        """
        Verify that PromptBuilder builds a formatted prompt including system instructions,
        conversation memory, and RAG context.
        """
        history = [{"role": "user", "content": "hello"}]
        context = "Product details: Aura gold ring, Price $499"
        
        prompt_messages = PromptBuilder.build_chat_prompt("recommend a ring", history, context)
        
        # Verify message roles structure
        self.assertEqual(len(prompt_messages), 3) # System, History, User
        self.assertEqual(prompt_messages[0]["role"], "system")
        self.assertIn("Aura gold ring", prompt_messages[0]["content"])
        self.assertIn("Grounding Rules", prompt_messages[0]["content"])
        self.assertEqual(prompt_messages[1]["role"], "user")
        self.assertEqual(prompt_messages[1]["content"], "hello")
        self.assertEqual(prompt_messages[2]["role"], "user")
        self.assertEqual(prompt_messages[2]["content"], "recommend a ring")

if __name__ == "__main__":
    unittest.main()
