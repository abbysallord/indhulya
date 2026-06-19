import unittest
from unittest.mock import patch
from fastapi import HTTPException

# Setup mock env key
import os
os.environ["GROQ_API_KEY"] = "mock-key"

from app.services.rag.rag_service import rag_service
from app.services.chat_service import ChatService
from app.schemas.chat import ChatRequest
from app.services.prompt_builder import PromptBuilder

class TestRAGAndGuestChat(unittest.TestCase):
    def test_retriever_exact_matches(self):
        """
        Verify that TF-IDF search retrieves the correct documents for specific keyword queries.
        """
        # Test product matching
        context_gold, _ = rag_service.get_context("gold ring")
        self.assertIn("Aura Minimalist Ring", context_gold)
        self.assertIn("18K Yellow Gold", context_gold) # linked material name check
        
        # Test collection matching
        context_heritage, _ = rag_service.get_context("Heritage collection")
        self.assertIn("Heritage Collection", context_heritage)
        
        # Test FAQ matching
        context_return, _ = rag_service.get_context("return policy")
        self.assertIn("30-day return policy", context_return)

    def test_retriever_no_match(self):
        """
        Verify that search queries for out-of-catalog items return empty context.
        """
        context_unrelated, _ = rag_service.get_context("spaceships and laser swords")
        self.assertEqual(context_unrelated, "")

    @patch('app.services.conversation_orchestrator.llm_service')
    def test_guest_session_chat_flow(self, mock_llm):
        """
        Verify the stateless guest session generation and reply generation flow.
        """
        mock_llm.generate_chat_response.return_value = "This is a mock reply about the Aura ring."
        
        # 1. Start a new guest session
        request = ChatRequest(message="Tell me about the Aura ring", session_id=None)
        response = ChatService.process_chat(request, user_id=None)
        
        guest_session_id = response.session_id
        self.assertIsNotNone(guest_session_id)
        self.assertEqual(response.response, "This is a mock reply about the Aura ring.")
        
        # 2. Continue the guest conversation by passing history
        history = [
            {"role": "user", "content": "Tell me about the Aura ring"},
            {"role": "assistant", "content": response.response}
        ]
        request_followup = ChatRequest(message="What is its price?", session_id=guest_session_id, history=history)
        response_followup = ChatService.process_chat(request_followup, user_id=None)
        
        self.assertEqual(response_followup.session_id, guest_session_id)

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

    def test_query_classifier_intents(self):
        """
        Verify query classifications match expectations for different intents.
        """
        from app.services.rag.classifier import QueryClassifier
        
        self.assertEqual(QueryClassifier.classify("What is 22K gold?"), "MATERIAL")
        self.assertEqual(QueryClassifier.classify("Show me diamond rings"), "PRODUCT")
        self.assertEqual(QueryClassifier.classify("What is your return policy?"), "POLICY")
        self.assertEqual(QueryClassifier.classify("Tell me about bridal collections"), "COLLECTION")
        self.assertEqual(QueryClassifier.classify("Hi there"), "GREETING")
        self.assertEqual(QueryClassifier.classify("help me custom design"), "FAQ")
        self.assertEqual(QueryClassifier.classify("some generic query about nothing"), "GENERAL")

    def test_synonym_expansion(self):
        """
        Verify that synonyms are expanded properly by the retriever.
        """
        expanded = rag_service.retriever.expand_query_synonyms("engagement ring")
        self.assertIn("bridal", expanded)
        self.assertIn("wedding", expanded)
        self.assertIn("band", expanded)
        self.assertIn("engagement", expanded)
        self.assertIn("ring", expanded)

    def test_retrieval_logging_analytics(self):
        """
        Verify that retrieval queries correctly log structured JSON lines to retrieval_analytics.jsonl.
        """
        import json
        
        log_path = rag_service.log_path
        
        # Record number of lines before query
        initial_lines = []
        if log_path.exists():
            with open(log_path, "r", encoding="utf-8") as f:
                initial_lines = f.readlines()
        
        # Execute query
        test_query = "Does Indhulya sell 18k gold jewelry?"
        rag_service.get_context(test_query)
        
        # Read lines after query
        self.assertTrue(log_path.exists(), "Analytics log file was not created/found")
        with open(log_path, "r", encoding="utf-8") as f:
            final_lines = f.readlines()
            
        self.assertEqual(len(final_lines), len(initial_lines) + 1)
        last_line = final_lines[-1].strip()
        
        log_data = json.loads(last_line)
        self.assertEqual(log_data["query"], test_query)
        self.assertEqual(log_data["detected_query_type"], "MATERIAL")
        self.assertIn("18k", log_data["expanded_query"])
        self.assertIn("gold", log_data["expanded_query"])
        self.assertIn("retrieved_doc_ids", log_data)
        self.assertIn("document_scores", log_data)
        self.assertIn("retrieval_latency_ms", log_data)

if __name__ == "__main__":
    unittest.main()
