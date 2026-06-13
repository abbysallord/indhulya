from app.db import queries
from app.core.settings import settings
from app.core.config import logger

class MemoryService:
    @staticmethod
    def get_recent_history(session_id: str) -> list:
        """
        Retrieves the last MAX_HISTORY_MESSAGES from the database for the given session.
        Returns a list of dicts formatted for the LLM.
        """
        try:
            # Get all messages ordered by created_at ascending
            all_messages = queries.get_chat_session_messages(session_id)
            
            # Slice to get only the last N messages
            max_msgs = settings.MAX_HISTORY_MESSAGES
            recent_messages = all_messages[-max_msgs:] if len(all_messages) > max_msgs else all_messages
            
            # Format for LLM consumption
            formatted_history = []
            for msg in recent_messages:
                formatted_history.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            logger.info(f"Loaded {len(formatted_history)} messages into memory for session {session_id}")
            return formatted_history
            
        except Exception as e:
            logger.error(f"Failed to load memory for session {session_id}: {str(e)}")
            # Fail gracefully, return empty history
            return []
