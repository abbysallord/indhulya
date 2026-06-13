from app.core.config import logger

class EmbeddingService:
    def __init__(self):
        logger.info("EmbeddingService initialized (Placeholder).")

    def generate_embedding(self, text: str) -> list:
        """
        Generates embedding vector for a given text.
        Placeholder implementation returning an empty list.
        """
        logger.info(f"Generating embedding for text length {len(text)} (Placeholder)")
        return []
