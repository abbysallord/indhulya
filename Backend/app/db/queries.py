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
    if not supabase:
        logger.error("[DB-Query] Supabase client is not initialized.")
        return {"id": "mock-session-id", "user_id": user_id, "title": title}
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
    if not supabase:
        logger.error("[DB-Query] Supabase client is not initialized.")
        return {"id": "mock-message-id", "session_id": session_id, "role": role, "content": content}
    response = supabase.table("chat_messages").insert(data).execute()
    return response.data[0]

def get_chat_sessions(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all chat sessions for a user.
    """
    logger.info(f"[DB-Query] Retrieving sessions for user {user_id}")
    if not supabase:
        return []
    response = supabase.table("chat_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return response.data

def get_chat_session_by_id(session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single chat session. Checks ownership via user_id.
    """
    logger.info(f"[DB-Query] Retrieving session {session_id}")
    if not supabase:
        return None
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
    if not supabase:
        return []
    response = supabase.table("chat_messages").select("*").eq("session_id", session_id).order("created_at").execute()
    return response.data

def delete_chat_session(session_id: str, user_id: str) -> bool:
    """
    Deletes a chat session if it belongs to the user.
    """
    logger.info(f"[DB-Query] Deleting session {session_id}")
    if not supabase:
        return False
    response = supabase.table("chat_sessions").delete().eq("id", session_id).eq("user_id", user_id).execute()
    return len(response.data) > 0

# --- Consolidated User Preferences ---

def get_user_preferences(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves persistent user preferences from Supabase.
    """
    logger.info(f"[DB-Query] Retrieving user preferences for user {user_id}")
    if not supabase:
        return None
    try:
        response = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        logger.error(f"[DB-Query] Error retrieving user preferences: {str(e)}")
    return None

def save_user_preferences(user_id: str, data: Dict[str, Any]) -> bool:
    """
    Saves or updates user preferences in Supabase.
    """
    logger.info(f"[DB-Query] Saving user preferences for user {user_id}")
    if not supabase:
        return False
    try:
        payload = {
            "user_id": user_id,
            "preferred_materials": data.get("preferred_materials", []),
            "preferred_categories": data.get("preferred_categories", []),
            "budget_min": data.get("budget_min"),
            "budget_max": data.get("budget_max"),
            "occasions": data.get("occasions", []),
            "style_preferences": data.get("style_preferences", [])
        }
        supabase.table("user_preferences").upsert(payload).execute()
        return True
    except Exception as e:
        logger.error(f"[DB-Query] Error saving user preferences: {str(e)}")
        return False

# --- Consolidated Conversation State ---

def get_conversation_state(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves the conversation state from Supabase.
    """
    logger.info(f"[DB-Query] Retrieving conversation state for session {session_id}")
    if not supabase:
        return None
    try:
        response = supabase.table("conversation_state").select("*").eq("session_id", session_id).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        logger.error(f"[DB-Query] Error retrieving conversation state: {str(e)}")
    return None

def save_conversation_state(session_id: str, state: str, context_data: Dict[str, Any]) -> bool:
    """
    Saves or updates the conversation state in Supabase.
    """
    logger.info(f"[DB-Query] Saving conversation state for session {session_id} as state: {state}")
    if not supabase:
        return False
    try:
        payload = {
            "session_id": session_id,
            "state": state,
            "context_data": context_data
        }
        supabase.table("conversation_state").upsert(payload).execute()
        return True
    except Exception as e:
        logger.error(f"[DB-Query] Error saving conversation state: {str(e)}")
        return False

# --- Consolidated Leads ---

def create_lead(lead_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Creates a new lead capture record in Supabase.
    """
    logger.info(f"[DB-Query] Saving captured lead info to Supabase")
    if not supabase:
        return None
    try:
        response = supabase.table("leads").insert(lead_data).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        logger.error(f"[DB-Query] Error creating lead: {str(e)}")
    return None

# --- Consolidated Recommendation History ---

def save_recommendation_history(
    session_id: str, user_id: Optional[str], query: str, recommended_products: List[str], scores: Dict[str, float]
) -> Optional[Dict[str, Any]]:
    """
    Persists recommendation history trace in Supabase.
    """
    logger.info(f"[DB-Query] Saving recommendation history for session {session_id}")
    if not supabase:
        return None
    try:
        payload = {
            "session_id": session_id,
            "user_id": user_id,
            "query": query,
            "recommended_products": recommended_products,
            "scores": scores
        }
        response = supabase.table("recommendation_history").insert(payload).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        logger.error(f"[DB-Query] Error saving recommendation history: {str(e)}")
    return None

def create_user_profile(user_id: str, email: str, full_name: str) -> Optional[Dict[str, Any]]:
    """
    Creates a new public user profile in the database.
    Table: profiles
    """
    logger.info(f"[DB-Query] Saving user profile for {user_id} ({email})")
    if not supabase:
        return None
    try:
        payload = {
            "id": user_id,
            "email": email,
            "full_name": full_name
        }
        response = supabase.table("profiles").insert(payload).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        logger.error(f"[DB-Query] Error creating user profile: {str(e)}")
    return None

