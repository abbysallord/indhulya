from app.core.config import logger
from app.services.rag.retriever import DocumentRetriever
from app.services.rag.embedding_service import EmbeddingService
from app.services.rag.ingestion import DataIngestionService

class RAGService:
    """
    Orchestrates the RAG (Retrieval-Augmented Generation) pipeline context construction.
    Loads/ingests seed datasets on startup and executes search queries over the catalog.
    """
    def __init__(self):
        logger.info("Initializing RAGService...")
        self.embedding_service = EmbeddingService()
        self.retriever = DocumentRetriever()
        
        # Initialize and run data ingestion
        self.ingestion_service = DataIngestionService(self.retriever)
        try:
            self.ingestion_service.ingest_all()
        except Exception as e:
            logger.error(f"Error during seed data ingestion: {str(e)}")

    def get_context(self, query: str) -> str:
        """
        Retrieves matching documents for the query and formats them into a context block
        for LLM injection.
        """
        logger.info(f"RAG query matching for: '{query}'")
        docs = self.retriever.retrieve_documents(query)
        if not docs:
            logger.info("No matching context documents found.")
            return ""
            
        # Format documents into a clear context section
        context_parts = []
        for doc in docs:
            content = doc.get("content", "")
            source = doc.get("metadata", {}).get("source", "unknown")
            context_parts.append(f"[Document Source: {source}]\n{content}")
            
        return "\n\n---\n\n".join(context_parts)

rag_service = RAGService()
