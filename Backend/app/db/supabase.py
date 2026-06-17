from supabase import create_client, Client
from app.core.settings import settings
from app.core.config import logger

supabase: Client = None

try:
    # Setup Supabase client with service role key for administrative access
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    logger.info("Supabase client successfully initialized with Service Role Key.")
except Exception as e:
    logger.error(f"Error during Supabase client initialization: {str(e)}")
