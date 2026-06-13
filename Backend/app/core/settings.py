from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # API specifications
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Chatbot Backend"
    
    # Supabase configuration (with placeholder defaults for local fallback)
    SUPABASE_URL: str = "https://placeholder-url.supabase.co"
    SUPABASE_ANON_KEY: str = "placeholder-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "placeholder-service-key"
    
    # LLM keys and configuration
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    LLM_TEMPERATURE: float = 0.0
    LLM_TIMEOUT: float = 30.0
    LLM_MAX_RETRIES: int = 3
    MAX_HISTORY_MESSAGES: int = 10
    
    # CORS config
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
