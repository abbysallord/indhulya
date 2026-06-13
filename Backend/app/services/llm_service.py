from groq import Groq
from app.core.settings import settings
from app.core.config import logger

class LLMService:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip() not in ("", "your-groq-api-key"):
            try:
                self.client = Groq(api_key=settings.GROQ_API_KEY)
                logger.info("Groq client successfully initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {str(e)}")
        else:
            logger.warning("GROQ_API_KEY is not configured. LLMService will run in mock fallback mode.")

    def generate_chat_response(self, user_message: str, model: str = None) -> str:
        """
        Requests completion response from the Groq API.
        If the client is uninitialized, returns a structured mock fallback response.
        """
        if not self.client:
            return (
                f"[Mock Fallback - GROQ_API_KEY not set] "
                f"You asked: '{user_message}'. Configure your GROQ_API_KEY in .env "
                f"to enable live Groq completions."
            )

        selected_model = model or settings.GROQ_MODEL
        try:
            logger.info(f"Sending request to Groq API using model '{selected_model}'")
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": user_message,
                    }
                ],
                model=selected_model,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API chat completion failed: {str(e)}")
            return f"Error communicating with Groq API: {str(e)}"

llm_service = LLMService()
