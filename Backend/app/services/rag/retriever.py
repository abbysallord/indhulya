import math
import re
from typing import List, Dict, Any
from app.core.config import logger
from app.core.settings import settings

class Document:
    def __init__(self, doc_id: str, content: str, metadata: Dict[str, Any]):
        self.id = doc_id
        self.content = content
        self.metadata = metadata
        self.tokens: List[str] = []  # Tokenized content for TF-IDF calculations

class DocumentRetriever:
    # Configurable synonym map to expand keywords before query tokenization
    SYNONYMS = {
        "engagement": ["bridal", "wedding"],
        "wedding": ["bridal"],
        "gold": ["22k", "18k"],
        "ring": ["band"],
        "bangle": ["bracelet"],
        "necklace": ["chain", "haar"],
        "diamond": ["solitaire"]
    }

    def __init__(self):
        logger.info("DocumentRetriever initialized.")
        self.documents: List[Document] = []
        self.doc_frequencies: Dict[str, int] = {}
        self.N = 0

    def set_documents(self, documents: List[Document]):
        """
        Loads document list and builds vocabulary index/document frequencies.
        """
        self.documents = documents
        self.N = len(documents)
        
        # Calculate document frequencies (DF) for each term
        self.doc_frequencies = {}
        for doc in documents:
            doc.tokens = self._tokenize(doc.content)
            seen_terms = set(doc.tokens)
            for term in seen_terms:
                self.doc_frequencies[term] = self.doc_frequencies.get(term, 0) + 1
        logger.info(f"Retriever indexed {self.N} documents successfully.")

    def _tokenize(self, text: str) -> List[str]:
        """
        Tokenizes document content: normalizes case, removes punctuation,
        and filters out standard stop words.
        """
        text = text.lower()
        tokens = re.findall(r'\b[a-z0-9]+\b', text)
        stop_words = {
            'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 
            'is', 'are', 'was', 'were', 'of', 'from', 'by', 'about', 'how', 'do'
        }
        return [t for t in tokens if t not in stop_words]

    def _idf(self, term: str) -> float:
        """
        Calculates inverse document frequency (IDF) for a term.
        """
        df = self.doc_frequencies.get(term, 0)
        if df == 0:
            return 0.0
        return math.log(1.0 + (self.N / df))

    def expand_query_synonyms(self, query: str) -> str:
        """
        Scans search query and appends synonyms for matched catalog keywords.
        """
        words = query.lower().split()
        expanded = list(words)
        for word in words:
            clean_word = re.sub(r'[^\w]', '', word)
            if clean_word in self.SYNONYMS:
                expanded.extend(self.SYNONYMS[clean_word])
        return " ".join(expanded)

    def filter_documents_by_metadata(self, query: str, query_type: str) -> List[Document]:
        """
        Filters candidate documents by their metadata attributes based on query intent.
        Falls back to the full dataset if filtering returns 0 matches.
        """
        filtered = list(self.documents)
        query_clean = query.lower()

        # 1. Filter by document type matching classifier classification
        type_map = {
            "PRODUCT": "product",
            "MATERIAL": "material",
            "COLLECTION": "collection",
            "FAQ": "faq",
            "POLICY": "faq"
        }
        if query_type in type_map:
            target_type = type_map[query_type]
            filtered = [d for d in filtered if d.metadata.get("type") == target_type]

        # 2. Filter by specific product category references
        category_matches = []
        if "ring" in query_clean or "band" in query_clean:
            category_matches.append("Ring")
        if "earring" in query_clean or "stud" in query_clean:
            category_matches.append("Earrings")
        if "necklace" in query_clean or "chain" in query_clean or "pendant" in query_clean or "haar" in query_clean:
            category_matches.append("Necklace")
        
        if category_matches:
            # Drop product items that don't match category (keep other doc types like FAQs/materials)
            filtered = [
                d for d in filtered 
                if d.metadata.get("type") != "product" or d.metadata.get("category") in category_matches
            ]

        # 3. Filter by metal or gemstone references
        material_matches = []
        if "gold" in query_clean or "18k" in query_clean or "22k" in query_clean:
            material_matches.append("18k-gold")
        if "silver" in query_clean or "925" in query_clean:
            material_matches.append("sterling-silver")
        if "platinum" in query_clean or "pt950" in query_clean:
            material_matches.append("platinum-950")
            
        if material_matches:
            filtered = [
                d for d in filtered 
                if d.metadata.get("type") != "product" or d.metadata.get("material_id") in material_matches
            ]

        # 4. Filter by specific design collection references
        collection_matches = []
        if "heritage" in query_clean:
            collection_matches.append("heritage")
        if "aura" in query_clean:
            collection_matches.append("aura")
        if "nirvana" in query_clean:
            collection_matches.append("nirvana")
            
        if collection_matches:
            filtered = [
                d for d in filtered 
                if d.metadata.get("type") != "product" or d.metadata.get("collection_id") in collection_matches
            ]

        # Safe Fallback check:
        if not filtered:
            logger.info("Metadata filtering resulted in 0 candidates. Falling back to the full document set.")
            return self.documents
            
        logger.info(f"Metadata filter narrowed scope from {len(self.documents)} to {len(filtered)} candidate documents.")
        return filtered

    def retrieve(self, query: str) -> List[Dict[str, Any]]:
        """
        Alias for backward compatibility.
        """
        return self.retrieve_documents(query)

    def retrieve_documents(self, query: str, query_type: str = "GENERAL") -> List[Dict[str, Any]]:
        """
        Retrieves top_k matching documents by scoring candidate items.
        """
        if not self.documents:
            logger.warning("Retriever has no documents loaded.")
            return []
            
        # Step 1: Synonym Expansion
        expanded_query = query
        if settings.RAG_ENABLE_SYNONYM_EXPANSION:
            expanded_query = self.expand_query_synonyms(query)
            logger.info(f"Expanded search query: '{query}' -> '{expanded_query}'")

        # Step 2: Metadata filtering pre-selection
        candidate_docs = self.documents
        if settings.RAG_ENABLE_METADATA_FILTERING:
            candidate_docs = self.filter_documents_by_metadata(expanded_query, query_type)

        # Step 3: Tokenize expanded query
        query_tokens = self._tokenize(expanded_query)
        if not query_tokens:
            return []

        # Step 4: TF-IDF Scoring
        query_weights = {}
        for token in set(query_tokens):
            query_weights[token] = self._idf(token)

        scores = []
        for doc in candidate_docs:
            doc_tokens = doc.tokens
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
                    tf = doc_tf[token] / len(doc_tokens)
                    idf = self._idf(token)
                    score += tf * idf * query_weights[token]
            
            scores.append((score, doc))

        # Filter out documents with scores below threshold
        threshold = settings.RAG_MIN_SCORE_THRESHOLD
        relevant_scores = [item for item in scores if item[0] >= threshold]
        
        # Sort documents by score descending
        relevant_scores.sort(key=lambda x: x[0], reverse=True)
        
        # Format results and apply limits
        results = []
        max_results = settings.RAG_MAX_RESULTS
        for score, doc in relevant_scores[:max_results]:
            results.append({
                "id": doc.id,
                "content": doc.content,
                "score": score,
                "metadata": doc.metadata
            })
            
        logger.info(f"Retrieved {len(results)} matches above threshold {threshold} (max limit: {max_results})")
        return results
