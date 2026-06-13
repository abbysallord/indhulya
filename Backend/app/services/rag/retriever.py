import math
import re
from typing import List, Dict, Any
from app.core.config import logger

class Document:
    def __init__(self, doc_id: str, content: str, metadata: Dict[str, Any]):
        self.id = doc_id
        self.content = content
        self.metadata = metadata

class DocumentRetriever:
    def __init__(self):
        logger.info("DocumentRetriever initialized.")
        self.documents: List[Document] = []
        self.tokenized_docs: List[List[str]] = []
        self.doc_frequencies: Dict[str, int] = {}
        self.N = 0

    def set_documents(self, documents: List[Document]):
        """
        Loads document list and builds vocabulary index/document frequencies.
        """
        self.documents = documents
        self.N = len(documents)
        self.tokenized_docs = [self._tokenize(doc.content) for doc in documents]
        
        # Calculate document frequencies (DF) for each term
        self.doc_frequencies = {}
        for doc_tokens in self.tokenized_docs:
            seen_terms = set(doc_tokens)
            for term in seen_terms:
                self.doc_frequencies[term] = self.doc_frequencies.get(term, 0) + 1
        logger.info(f"Retriever indexed {self.N} documents successfully.")

    def _tokenize(self, text: str) -> List[str]:
        """
        Tokenizes document content: normalizes case, removes punctuation,
        and filters out standard stop words.
        """
        text = text.lower()
        # Extract alphanumeric tokens
        tokens = re.findall(r'\b[a-z0-9]+\b', text)
        # Filter out common stop words to improve term importance ranking
        stop_words = {
            'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 
            'is', 'are', 'was', 'were', 'of', 'from', 'by', 'about', 'about', 'how', 'do'
        }
        return [t for t in tokens if t not in stop_words]

    def _idf(self, term: str) -> float:
        """
        Calculates inverse document frequency (IDF) for a term.
        """
        df = self.doc_frequencies.get(term, 0)
        if df == 0:
            return 0.0
        # Smooth formula to prevent divide-by-zero or negative weights
        return math.log(1.0 + (self.N / df))

    def retrieve(self, query: str) -> List[Dict[str, Any]]:
        """
        Alias for retrieve_documents to maintain compatibility.
        """
        return self.retrieve_documents(query)

    def retrieve_documents(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Tokenizes query, computes TF-IDF weights, ranks all indexed documents
        based on similarity, and returns the top_k matching documents.
        """
        if not self.documents:
            logger.warning("Retriever has no documents loaded.")
            return []
            
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        # Compute IDF query weights
        query_weights = {}
        for token in set(query_tokens):
            query_weights[token] = self._idf(token)

        scores = []
        for idx, doc in enumerate(self.documents):
            doc_tokens = self.tokenized_docs[idx]
            if not doc_tokens:
                scores.append((0.0, doc))
                continue

            # Compute term frequencies (TF) in the document
            doc_tf = {}
            for token in doc_tokens:
                doc_tf[token] = doc_tf.get(token, 0) + 1
            
            # Compute TF-IDF dot product score
            score = 0.0
            for token in query_tokens:
                if token in doc_tf:
                    # Term frequency normalized by doc length
                    tf = doc_tf[token] / len(doc_tokens)
                    idf = self._idf(token)
                    score += tf * idf * query_weights[token]
            
            scores.append((score, doc))

        # Filter out zero/unmatched score entries
        relevant_scores = [item for item in scores if item[0] > 0.0]
        
        # Sort documents by score descending
        relevant_scores.sort(key=lambda x: x[0], reverse=True)
        
        # Format output similar to search results
        results = []
        for score, doc in relevant_scores[:top_k]:
            results.append({
                "id": doc.id,
                "content": doc.content,
                "score": score,
                "metadata": doc.metadata
            })
            
        logger.info(f"Retrieved {len(results)} matching documents for query: '{query}'")
        return results
