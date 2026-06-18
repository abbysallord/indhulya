import unittest
from unittest.mock import patch, MagicMock
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRequest

class TestConversationalAudit(unittest.TestCase):
    @patch('app.services.conversation_orchestrator.queries')
    @patch('app.services.conversation_orchestrator.llm_service')
    @patch('app.services.conversation_orchestrator.rag_service')
    def test_greetings_bypass_retrieval(self, mock_rag, mock_llm, mock_queries):
        # Mocks setup
        mock_queries.get_user_profile_by_id.return_value = None
        mock_llm.generate_chat_response.return_value = "Hello! How can I assist you with Indhulya premium jewelry today?"
        mock_rag.get_context.return_value = ""

        # Test "Hi"
        req_hi = ChatRequest(message="Hi", session_id="test-session")
        res_hi = ChatService.process_chat(req_hi, user_id=None)
        
        # Verify RAG was bypassed (call_count is 0)
        self.assertEqual(mock_rag.get_context.call_count, 0)
        self.assertNotIn("I am sorry, but that information is not available in our current catalog.", res_hi.response)

        # Test "Hello"
        mock_rag.reset_mock()
        req_hello = ChatRequest(message="Hello", session_id="test-session")
        res_hello = ChatService.process_chat(req_hello, user_id=None)
        self.assertEqual(mock_rag.get_context.call_count, 0)
        self.assertNotIn("I am sorry, but that information is not available in our current catalog.", res_hello.response)

    @patch('app.services.conversation_orchestrator.queries')
    @patch('app.services.conversation_orchestrator.llm_service')
    @patch('app.services.conversation_orchestrator.rag_service')
    def test_preference_updates_bypass_retrieval(self, mock_rag, mock_llm, mock_queries):
        mock_queries.get_user_profile_by_id.return_value = None
        mock_llm.generate_chat_response.return_value = "Understood! A budget of 50,000 INR is about 600 USD. Let's find you something wonderful!"
        mock_rag.get_context.return_value = ""

        # Test budget update "My budget is 50,000"
        req = ChatRequest(message="My budget is 50,000", session_id="test-session")
        res = ChatService.process_chat(req, user_id=None)
        self.assertEqual(mock_rag.get_context.call_count, 0)
        self.assertNotIn("I am sorry, but that information is not available in our current catalog.", res.response)

    @patch('app.services.conversation_orchestrator.queries')
    @patch('app.services.conversation_orchestrator.llm_service')
    @patch('app.services.conversation_orchestrator.rag_service')
    def test_discovery_bypass_retrieval(self, mock_rag, mock_llm, mock_queries):
        mock_queries.get_user_profile_by_id.return_value = None
        mock_llm.generate_chat_response.return_value = "I can help you find a necklace! Is this for a wedding, daily wear, or gifting?"
        mock_rag.get_context.return_value = ""

        # Test "I need a necklace"
        req = ChatRequest(message="I need a necklace", session_id="test-session")
        res = ChatService.process_chat(req, user_id=None)
        self.assertEqual(mock_rag.get_context.call_count, 0)
        self.assertNotIn("I am sorry, but that information is not available in our current catalog.", res.response)

    @patch('app.services.conversation_orchestrator.queries')
    @patch('app.services.conversation_orchestrator.llm_service')
    @patch('app.services.conversation_orchestrator.rag_service')
    def test_retrieval_mode_executes_rag(self, mock_rag, mock_llm, mock_queries):
        mock_queries.get_user_profile_by_id.return_value = None
        mock_llm.generate_chat_response.return_value = "Our return policy allows 30-day exchanges."
        mock_rag.get_context.return_value = "Return policy details..."

        # Test "What is your return policy?"
        req_policy = ChatRequest(message="What is your return policy?", session_id="test-session")
        res_policy = ChatService.process_chat(req_policy, user_id=None)
        self.assertGreater(mock_rag.get_context.call_count, 0)
        mock_rag.get_context.assert_called_with("What is your return policy?")

        # Test "Tell me about 22K gold"
        mock_rag.reset_mock()
        req_gold = ChatRequest(message="Tell me about 22K gold", session_id="test-session")
        res_gold = ChatService.process_chat(req_gold, user_id=None)
        self.assertGreater(mock_rag.get_context.call_count, 0)
        mock_rag.get_context.assert_called_with("Tell me about 22K gold")

        # Test "Show me diamond rings"
        mock_rag.reset_mock()
        req_rings = ChatRequest(message="Show me diamond rings", session_id="test-session")
        res_rings = ChatService.process_chat(req_rings, user_id=None)
        self.assertGreater(mock_rag.get_context.call_count, 0)

if __name__ == '__main__':
    unittest.main()
