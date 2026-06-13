from typing import List, Dict, Any, Optional
from app.db.supabase import supabase
from app.core.config import logger

def create_chat_session(user_id: str, title: str = "New Chat Session") -> Dict[str, Any]:
    """
    Creates a new chat session in the database.
    Table: chat_sessions
    """
    logger.info(f"[DB-Query] Creating chat session for user: {user_id}")
    data = {
        "user_id": user_id,
        "title": title
    }
    response = supabase.table("chat_sessions").insert(data).execute()
    return response.data[0]

def save_chat_message(session_id: str, role: str, content: str) -> Dict[str, Any]:
    """
    Saves a new chat message under a specific session.
    Table: chat_messages
    """
    logger.info(f"[DB-Query] Saving message for session {session_id} with role '{role}'")
    data = {
        "session_id": session_id,
        "role": role,
        "content": content
    }
    response = supabase.table("chat_messages").insert(data).execute()
    return response.data[0]

def get_chat_sessions(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all chat sessions for a user.
    """
    logger.info(f"[DB-Query] Retrieving sessions for user {user_id}")
    response = supabase.table("chat_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return response.data

def get_chat_session_by_id(session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single chat session. Checks ownership via user_id.
    """
    logger.info(f"[DB-Query] Retrieving session {session_id}")
    response = supabase.table("chat_sessions").select("*").eq("id", session_id).eq("user_id", user_id).execute()
    if not response.data:
        return None
    return response.data[0]

def get_chat_session_messages(session_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all chat messages for a specific session.
    Table: chat_messages
    """
    logger.info(f"[DB-Query] Retrieving messages for session {session_id}")
    response = supabase.table("chat_messages").select("*").eq("session_id", session_id).order("created_at").execute()
    return response.data

def delete_chat_session(session_id: str, user_id: str) -> bool:
    """
    Deletes a chat session if it belongs to the user.
    """
    logger.info(f"[DB-Query] Deleting session {session_id}")
    response = supabase.table("chat_sessions").delete().eq("id", session_id).eq("user_id", user_id).execute()
    return len(response.data) > 0

