import re
from app.core.config import logger

class QueryClassifier:
    """
    Classifies user queries into semantic types (GREETING, POLICY, FAQ, PRODUCT, 
    MATERIAL, COLLECTION, GENERAL) to help pre-filter or narrow the search scope.
    Checks PRODUCT intent before MATERIAL/COLLECTION so that queries like 'gold ring'
    or 'Aura earrings' are routed to the product catalog first.
    """
    PATTERNS = {
        "GREETING": r"\b(hi|hello|hey|greetings|good\s+morning|good\s+afternoon|good\s+evening|yo|wasup)\b",
        "POLICY": r"\b(return|returns|refund|refunds|exchange|exchanges|shipping|ship|shipped|delivery|deliver|deliveries|warranty|policies|policy|guarantee)\b",
        "FAQ": r"\b(faq|faqs|support|contact|email|help|customer|service|customize|customized|customization|custom|design|repair|repairs)\b",
        "PRODUCT": r"\b(ring|rings|earring|earrings|stud|studs|necklace|necklaces|chain|chains|pendant|pendants|bangle|bangles|bracelet|bracelets|price|prices|cost|how\s+much|availability|buy|purchase|catalog|in\s+stock|order|stock)\b",
        "MATERIAL": r"\b(gold|silver|platinum|diamond|diamonds|solitaire|solitaires|karat|18k|22k|925|purity|metal|alloy|hallmark|hallmarked|bis|care|clean|cleaning|tarnish)\b",
        "COLLECTION": r"\b(collection|collections|heritage|aura|nirvana|theme|launch|year)\b"
    }

    @classmethod
    def classify(cls, query: str) -> str:
        """
        Runs regex-based classification on the normalized query string.
        """
        query_clean = query.lower().strip()
        
        # 1. Greetings (should bypass heavy RAG context generation)
        if re.search(cls.PATTERNS["GREETING"], query_clean):
            category = "GREETING"
        # 2. Policies
        elif re.search(cls.PATTERNS["POLICY"], query_clean):
            category = "POLICY"
        # 3. FAQs and custom requests
        elif re.search(cls.PATTERNS["FAQ"], query_clean):
            category = "FAQ"
        # 4. Specific product requests (checked early to capture material/collection bounds)
        elif re.search(cls.PATTERNS["PRODUCT"], query_clean):
            category = "PRODUCT"
        # 5. Materials specifications
        elif re.search(cls.PATTERNS["MATERIAL"], query_clean):
            category = "MATERIAL"
        # 6. Collection topics
        elif re.search(cls.PATTERNS["COLLECTION"], query_clean):
            category = "COLLECTION"
        else:
            category = "GENERAL"
            
        logger.info(f"Query classification for '{query}' detected as: {category}")
        return category
