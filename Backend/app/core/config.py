import logging
from app.core.settings import settings

# Configure basic logging for the backend
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("chatbot_backend")

# Inspect and warn about placeholder credentials
if settings.SUPABASE_URL == "https://placeholder-url.supabase.co" or settings.SUPABASE_KEY == "placeholder-anon-key":
    logger.warning(
        "Using placeholder Supabase URL or Key. Please configure real credentials in .env "
        "for actual Supabase integrations."
    )

PROJECT_NAME = settings.PROJECT_NAME
API_V1_STR = settings.API_V1_STR
