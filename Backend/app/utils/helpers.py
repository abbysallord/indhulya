from datetime import datetime

def get_current_utc_timestamp() -> str:
    """
    Returns the current UTC time formatted as an ISO-8601 string.
    """
    return datetime.utcnow().isoformat() + "Z"

def format_session_title(first_message: str, max_length: int = 30) -> str:
    """
    Generates a concise preview/title from a chat message.
    """
    if not first_message:
        return "New Chat Session"
    first_message = first_message.strip()
    if len(first_message) <= max_length:
        return first_message
    return first_message[:max_length] + "..."
