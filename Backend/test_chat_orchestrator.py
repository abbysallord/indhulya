import unittest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException

# Configure settings before importing app components to avoid errors
import os
os.environ["GROQ_API_KEY"] = "mock-groq-key"

from app.services.chat_service import ChatService
from app.schemas.chat import ChatRequest

class TestChatOrchestrator(unittest.TestCase):
    @patch('app.services.conversation_orchestrator.queries')
    @patch('app.services.conversation_orchestrator.MemoryService')
    @patch('app.services.conversation_orchestrator.PromptBuilder')
    @patch('app.services.conversation_orchestrator.llm_service')
    @patch('app.services.conversation_orchestrator.rag_service')
    def test_process_chat_new_session(self, mock_rag, mock_llm, mock_prompt, mock_memory, mock_queries):
        # Setup mocks
        mock_queries.create_chat_session.return_value = {"id": "new-session-uuid", "title": "Test message"}
        mock_queries.get_user_profile_by_id.return_value = None
        mock_memory.get_recent_history.return_value = []
        mock_rag.get_context.return_value = "Mock RAG Context"
        mock_prompt.build_chat_prompt.return_value = [{"role": "system", "content": "Prompt"}]
        mock_llm.generate_chat_response.return_value = "Mock LLM Response"
        
        request = ChatRequest(message="Test message", session_id=None)
        user_id = "user-uuid"
        
        # Call process_chat
        response = ChatService.process_chat(request, user_id)
        
        # Verify calls
        mock_queries.create_chat_session.assert_called_once_with(user_id=user_id, title="Test message")
        mock_memory.get_recent_history.assert_called_once_with("new-session-uuid")
        mock_queries.save_chat_message.assert_any_call(session_id="new-session-uuid", role="user", content="Test message")
        mock_rag.get_context.assert_called_once_with("Test message")
        mock_prompt.build_chat_prompt.assert_called_once()
        self.assertEqual(mock_llm.generate_chat_response.call_count, 2)
        mock_queries.save_chat_message.assert_any_call(session_id="new-session-uuid", role="assistant", content="Mock LLM Response")
        
        # Assert response details
        self.assertEqual(response.response, "Mock LLM Response")
        self.assertEqual(response.session_id, "new-session-uuid")

    @patch('app.services.conversation_orchestrator.queries')
    @patch('app.services.conversation_orchestrator.MemoryService')
    @patch('app.services.conversation_orchestrator.PromptBuilder')
    @patch('app.services.conversation_orchestrator.llm_service')
    @patch('app.services.conversation_orchestrator.rag_service')
    def test_process_chat_existing_session_success(self, mock_rag, mock_llm, mock_prompt, mock_memory, mock_queries):
        # Setup mocks
        mock_queries.get_chat_session_by_id.return_value = {"id": "existing-uuid", "user_id": "user-uuid"}
        mock_queries.get_user_profile_by_id.return_value = None
        mock_memory.get_recent_history.return_value = [{"role": "user", "content": "prev query"}, {"role": "assistant", "content": "prev reply"}]
        mock_rag.get_context.return_value = ""
        mock_prompt.build_chat_prompt.return_value = [{"role": "system", "content": "Prompt"}]
        mock_llm.generate_chat_response.return_value = "Mock LLM Response"
        
        request = ChatRequest(message="New message", session_id="existing-uuid")
        user_id = "user-uuid"
        
        # Call process_chat
        response = ChatService.process_chat(request, user_id)
        
        # Verify calls
        mock_queries.get_chat_session_by_id.assert_called_once_with("existing-uuid", user_id)
        mock_queries.create_chat_session.assert_not_called()
        mock_memory.get_recent_history.assert_called_once_with("existing-uuid")
        mock_queries.save_chat_message.assert_any_call(session_id="existing-uuid", role="user", content="New message")
        mock_rag.get_context.assert_called_once_with("New message")
        mock_prompt.build_chat_prompt.assert_called_once()
        self.assertEqual(mock_llm.generate_chat_response.call_count, 2)
        mock_queries.save_chat_message.assert_any_call(session_id="existing-uuid", role="assistant", content="Mock LLM Response")
        
        # Assert response details
        self.assertEqual(response.response, "Mock LLM Response")
        self.assertEqual(response.session_id, "existing-uuid")

    @patch('app.services.conversation_orchestrator.queries')
    def test_process_chat_invalid_session(self, mock_queries):
        mock_queries.get_chat_session_by_id.return_value = None
        
        request = ChatRequest(message="New message", session_id="invalid-uuid")
        user_id = "user-uuid"
        
        with self.assertRaises(HTTPException) as ctx:
            ChatService.process_chat(request, user_id)
            
        self.assertEqual(ctx.exception.status_code, 404)
        mock_queries.get_chat_session_by_id.assert_called_once_with("invalid-uuid", user_id)

    @patch('app.services.conversation_orchestrator.queries')
    @patch('app.services.conversation_orchestrator.MemoryService')
    @patch('app.services.conversation_orchestrator.PromptBuilder')
    @patch('app.services.conversation_orchestrator.llm_service')
    @patch('app.services.conversation_orchestrator.rag_service')
    def test_process_chat_llm_failure(self, mock_rag, mock_llm, mock_prompt, mock_memory, mock_queries):
        mock_queries.get_chat_session_by_id.return_value = {"id": "existing-uuid", "user_id": "user-uuid"}
        mock_queries.get_user_profile_by_id.return_value = None
        mock_memory.get_recent_history.return_value = []
        mock_rag.get_context.return_value = ""
        mock_prompt.build_chat_prompt.return_value = []
        
        # Force LLM generation error
        mock_llm.generate_chat_response.side_effect = Exception("Groq API quota exceeded")
        
        request = ChatRequest(message="New message", session_id="existing-uuid")
        user_id = "user-uuid"
        
        with self.assertRaises(HTTPException) as ctx:
            ChatService.process_chat(request, user_id)
            
        self.assertEqual(ctx.exception.status_code, 502)
        # Verify user message was saved but assistant message was NOT
        mock_queries.save_chat_message.assert_any_call(session_id="existing-uuid", role="user", content="New message")
        # Ensure save_chat_message was only called once (for the user) and not for assistant
        self.assertEqual(mock_queries.save_chat_message.call_count, 1)

if __name__ == '__main__':
    unittest.main()
