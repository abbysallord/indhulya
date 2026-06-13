import sys
import os

# Align python path to backend root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.rag.rag_service import rag_service
from app.services.rag.classifier import QueryClassifier

def main():
    if len(sys.argv) < 2:
        print("Usage: venv\\Scripts\\python.exe evaluate_retrieval.py \"<user query>\"")
        sys.exit(1)

    query = sys.argv[1]
    print("=" * 70)
    print(f"INDHULYA RAG RETRIEVAL EVALUATOR")
    print("=" * 70)
    print(f"Original Query   : '{query}'")

    # 1. Query Classification
    query_type = QueryClassifier.classify(query)
    print(f"Query Intent     : {query_type}")

    # 2. Synonym Expansion
    expanded_query = rag_service.retriever.expand_query_synonyms(query)
    print(f"Expanded Query   : '{expanded_query}'")

    # 3. Pre-filters & Document Retrieval
    print("-" * 70)
    print("Matching Documents:")
    docs = rag_service.retriever.retrieve_documents(query, query_type)
    
    if not docs:
        print("No matching documents found above score threshold.")
    else:
        for idx, doc in enumerate(docs):
            print(f"\n[{idx + 1}] Doc ID: {doc['id']} (Score: {doc['score']:.4f})")
            print(f"    Source: {doc['metadata'].get('source', 'unknown')}")
            print(f"    Type:   {doc['metadata'].get('type', 'unknown')}")
            if doc['metadata'].get('type') == 'product':
                print(f"    Name:   {doc['metadata'].get('name')}")
                print(f"    Price:  ${doc['metadata'].get('price')}")
            print(f"    Content Preview:\n    " + doc['content'].replace("\n", "\n    "))
    print("=" * 70)

if __name__ == "__main__":
    main()
