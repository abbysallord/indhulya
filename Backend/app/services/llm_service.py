from groq import Groq
from typing import List, Dict
from app.core.settings import settings
from app.core.config import logger

class LLMService:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip() not in ("", "your-groq-api-key"):
            try:
                # Groq client supports timeouts and max_retries
                self.client = Groq(
                    api_key=settings.GROQ_API_KEY,
                    timeout=settings.LLM_TIMEOUT,
                    max_retries=settings.LLM_MAX_RETRIES
                )
                logger.info("Groq client successfully initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {str(e)}")
        else:
            logger.warning("GROQ_API_KEY is not configured. LLMService will run in mock fallback mode.")

    def generate_chat_response(self, messages: List[Dict[str, str]], model: str = None) -> str:
        """
        Requests completion response from the Groq API using a full prompt array.
        If the client is uninitialized, returns a structured mock fallback response.
        """
        if not self.client:
            # Extract last user message for mock
            last_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "No user message found")
            return (
                f"[Mock Fallback - GROQ_API_KEY not set] "
                f"You asked: '{last_msg}'. Configure your GROQ_API_KEY in .env "
                f"to enable live Groq completions."
            )

        selected_model = model or settings.GROQ_MODEL
        try:
            logger.info(f"Sending request to Groq API using model '{selected_model}' with {len(messages)} messages.")
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=selected_model,
                temperature=settings.LLM_TEMPERATURE
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API chat completion failed: {str(e)}")
            raise e # Raise to orchestrator for handling

llm_service = LLMService()
