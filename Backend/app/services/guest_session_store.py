from datetime import datetime, timezone
import uuid
from typing import Dict, List, Any

# Global in-memory guest sessions dict: session_id -> session_dict
GUEST_SESSIONS: Dict[str, Dict[str, Any]] = {}

def create_guest_session(guest_user_id: str = None, title: str = "Guest Chat Session") -> dict:
    """
    Creates a new guest session. Generates guest_user_id if none provided.
    """
    if not guest_user_id or guest_user_id.strip() == "":
        guest_user_id = f"guest_{uuid.uuid4()}"
    session_id = str(uuid.uuid4())
    session = {
        "id": session_id,
        "user_id": guest_user_id,
        "title": title,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "messages": []
    }
    GUEST_SESSIONS[session_id] = session
    return session

def get_guest_session(session_id: str) -> dict:
    """
    Retrieves a guest session by its ID.
    """
    return GUEST_SESSIONS.get(session_id)

def get_guest_sessions_by_user(guest_user_id: str) -> List[dict]:
    """
    Retrieves all guest sessions associated with a guest user ID.
    """
    return [s for s in GUEST_SESSIONS.values() if s["user_id"] == guest_user_id]

def save_guest_message(session_id: str, role: str, content: str) -> dict:
    """
    Saves a message (user or assistant) to a guest session.
    """
    session = GUEST_SESSIONS.get(session_id)
    if not session:
        return None
    msg = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "role": role,
        "content": content,
        "created_at": datetime.now(timezone.utc)
    }
    session["messages"].append(msg)
    session["updated_at"] = datetime.now(timezone.utc)
    return msg

def delete_guest_session(session_id: str) -> bool:
    """
    Deletes a guest session from the in-memory store.
    """
    if session_id in GUEST_SESSIONS:
        del GUEST_SESSIONS[session_id]
        return True
    return False
