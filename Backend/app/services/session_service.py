from app.db import queries
from app.core.config import logger
from fastapi import HTTPException

class SessionService:
    @staticmethod
    def create_session(user_id: str, title: str = "New Chat Session"):
        return queries.create_chat_session(user_id=user_id, title=title)
        
    @staticmethod
    def get_sessions(user_id: str):
        return queries.get_chat_sessions(user_id)
        
    @staticmethod
    def get_session(session_id: str, user_id: str):
        session = queries.get_chat_session_by_id(session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or not owned by user.")
        messages = queries.get_chat_session_messages(session_id)
        return {**session, "messages": messages}
        
    @staticmethod
    def delete_session(session_id: str, user_id: str):
        success = queries.delete_chat_session(session_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found or not owned by user.")
        return {"detail": "Session deleted"}
