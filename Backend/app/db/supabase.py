from supabase import create_client, Client
from app.core.settings import settings
from app.core.config import logger

supabase: Client = None

try:
    # Setup Supabase client
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    logger.info("Supabase client successfully initialized.")
except Exception as e:
    logger.error(f"Error during Supabase client initialization: {str(e)}")
