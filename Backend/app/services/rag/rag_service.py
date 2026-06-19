import json
import time
from pathlib import Path
from app.core.config import logger
from app.core.settings import settings
from app.services.rag.retriever import DocumentRetriever
from app.services.rag.embedding_service import EmbeddingService
from app.services.rag.ingestion import DataIngestionService
from app.services.rag.classifier import QueryClassifier

class RAGService:
    """
    Orchestrates the advanced RAG (Retrieval-Augmented Generation) pipeline.
    Responsible for query classification, matching context, optimization, and analytics tracking.
    """
    def __init__(self):
        logger.info("Initializing RAGService...")
        self.embedding_service = EmbeddingService()
        self.retriever = DocumentRetriever()
        
        # Load and ingest seed datasets on startup
        self.ingestion_service = DataIngestionService(self.retriever)
        try:
            self.ingestion_service.ingest_all()
        except Exception as e:
            logger.error(f"Error during seed data ingestion: {str(e)}")

        # Resolve analytics log path under backend root
        self.log_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "retrieval_analytics.jsonl"

    def get_context(self, query: str) -> tuple:
        """
        Processes query classification, retrieves matched context, optimizes it,
        logs latencies/metadata, and returns a tuple of:
          - context_string: grounded prompt content block (str)
          - image_urls: list of product image URLs from retrieved documents (list[str])
        """
        start_time = time.time()
        query_type = "GENERAL"
        
        # Step 1: Query Classification
        if settings.RAG_ENABLE_QUERY_CLASSIFICATION:
            try:
                query_type = QueryClassifier.classify(query)
            except Exception as e:
                logger.error(f"Query classification failed: {str(e)}")

        # Optimization: Salutation / Greeting queries bypass document lookup
        if query_type == "GREETING":
            logger.info("Greeting query detected. Bypassing search index retrieval.")
            latency_ms = round((time.time() - start_time) * 1000, 2)
            self._write_analytics(
                query=query,
                expanded_query=query,
                query_type=query_type,
                doc_ids=[],
                scores=[],
                latency_ms=latency_ms
            )
            return "", []

        # Step 2: Retrieve candidate documents matching the classification type
        docs = []
        try:
            docs = self.retriever.retrieve_documents(query, query_type)
        except Exception as e:
            logger.error(f"Document retrieval execution failed: {str(e)}")

        # Step 3: Context Optimization (Attribution, Deduplication, and Length Caps)
        context_parts = []
        seen_ids = set()
        current_length = 0
        max_length = 2500  # Enforced maximum characters in the prompt block

        for doc in docs:
            doc_id = doc.get("id")
            
            # Deduplicate by document ID
            if doc_id in seen_ids:
                continue
            seen_ids.add(doc_id)

            content = doc.get("content", "")
            source = doc.get("metadata", {}).get("source", "unknown")
            formatted_segment = f"[Document Source: {source}]\n{content}"

            # Length ceiling protection
            if current_length + len(formatted_segment) > max_length:
                logger.info(f"Context truncated at document '{doc_id}' to stay below {max_length} characters.")
                break

            context_parts.append(formatted_segment)
            current_length += len(formatted_segment)

        context_string = "\n\n---\n\n".join(context_parts)
        latency_ms = round((time.time() - start_time) * 1000, 2)

        # Collect image URLs from retrieved product documents
        image_urls = []
        seen_image_ids = set()
        for doc in docs:
            doc_id = doc.get("id")
            if doc_id in seen_image_ids:
                continue
            seen_image_ids.add(doc_id)
            img = doc.get("metadata", {}).get("image_url")
            if img:
                image_urls.append(img)

        # Step 4: Write Log Analytics
        expanded_query = query
        if settings.RAG_ENABLE_SYNONYM_EXPANSION:
            try:
                expanded_query = self.retriever.expand_query_synonyms(query)
            except Exception:
                pass

        doc_ids = [d.get("id") for d in docs]
        scores = [round(d.get("score", 0.0), 4) for d in docs]

        self._write_analytics(
            query=query,
            expanded_query=expanded_query,
            query_type=query_type,
            doc_ids=doc_ids,
            scores=scores,
            latency_ms=latency_ms
        )

        return context_string, image_urls

    def _write_analytics(self, query: str, expanded_query: str, query_type: str, doc_ids: list, scores: list, latency_ms: float):
        """
        Appends a structured query retrieval log entry to the JSONL file.
        """
        try:
            self.log_path.parent.mkdir(parents=True, exist_ok=True)
            log_entry = {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "query": query,
                "expanded_query": expanded_query,
                "detected_query_type": query_type,
                "retrieved_doc_ids": doc_ids,
                "document_scores": scores,
                "retrieved_count": len(doc_ids),
                "retrieval_latency_ms": latency_ms
            }
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception as e:
            logger.error(f"Failed to log retrieval analytics to {self.log_path}: {str(e)}")

rag_service = RAGService()
