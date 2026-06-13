# Indhulya AI Jewelry Assistant - Backend API

This is the production-ready, modular FastAPI backend that powers the **Indhulya AI Jewelry & Product Assistant**. It acts as a Retrieval-Grounded Generation (RAG) assistant, querying structured catalog data to answer user requests with zero hallucinations.

---

## 📁 Folder Structure

```text
Backend/
│
├── app/
│   ├── main.py                    # FastAPI entrypoint, routing, and CORS middleware
│   │
│   ├── api/
│   │   ├── deps.py                # Optional authentication dependencies
│   │   └── routes/                # Modular API endpoints
│   │       ├── auth.py            # User authentication routes (Supabase integration)
│   │       ├── chat.py            # Chat routing and session operations
│   │       └── health.py          # Health status checks
│   │
│   ├── core/
│   │   ├── config.py              # Logger and general constants
│   │   ├── limiter.py             # Rate limiter setup
│   │   ├── prompts.py             # Grounding instructions and system prompt definitions
│   │   └── settings.py            # Pydantic BaseSettings config and strategy options
│   │
│   ├── db/
│   │   ├── supabase.py            # Supabase database client
│   │   └── queries.py             # Placeholder DB query helpers
│   │
│   ├── schemas/
│   │   └── chat.py                # Pydantic schema schemas (request/response validation)
│   │
│   ├── services/
│   │   ├── chat_service.py        # Pipeline memory retrieval, history, and LLM query flow
│   │   ├── guest_session_store.py # In-memory caching for anonymous session CRUD
│   │   ├── llm_service.py         # Client mapping to Groq (Llama-3) API
│   │   ├── session_service.py     # Database session management
│   │   │
│   │   └── rag/                   # RAG Engine
│   │       ├── classifier.py      # Regex-based query classification
│   │       ├── embedding_service.py # Vector search/embeddings utility interface
│   │       ├── ingestion.py       # Catalog seed loader and reference linkage
│   │       ├── retriever.py       # Synonym expander, pre-filter, and TF-IDF matcher
│   │       └── rag_service.py     # Main RAG coordinator and analytics logger
│   │
│   └── utils/
│       └── helpers.py             # Helper tools
│
├── data/
│   ├── products.json              # Ring, necklace, and earring records
│   ├── materials.json             # Metal details (18K gold, Pt950, care guidelines)
│   ├── collections.json           # Aura, Heritage, and Nirvana design descriptions
│   ├── faqs.json                  # Return policies, shipping, and custom orders FAQs
│   └── retrieval_analytics.jsonl  # Append-only search logs with latencies & scores
│
├── evaluate_retrieval.py          # Offline search test script CLI
├── test_rag_and_guest_chat.py     # Unittests and integration tests
├── requirements.txt               # Project requirements
├── .env                           # Environment configuration overrides
└── Readme.md                      # Backend documentation
```

---

## ⚡ Key Features

### 1. Hybrid RAG Retrieval Engine
* **Query Intent Classification** (`classifier.py`): Maps user messages into intents (`PRODUCT`, `MATERIAL`, `COLLECTION`, `FAQ`, `POLICY`, `GREETING`, `GENERAL`). Greetings bypass catalog search completely to reduce latency.
* **Synonym Expansion** (`retriever.py`): Automatically maps related keywords (e.g. `engagement` ➔ `bridal/wedding`, `ring` ➔ `band`) before tokenization to improve match recall.
* **Metadata-Aware Pre-filtering**: Filters candidate documents dynamically based on metal types, product categories, collections, and catalog types. Automatically falls back to the full dataset if pre-filtering returns zero matches.
* **TF-IDF Dot Product Scoring**: Standard token-matching search using custom TF-IDF weights to return the most relevant snippets.

### 2. Context Optimization & Grounding
* **Strict Grounding Rules**: The system prompt instructs the LLM to only answer using provided context. If no context matches are found, it outputs: *"I am sorry, but that information is not available in our current catalog."*
* **Zero Temperature**: Default temperature is set to `0.0` to guarantee deterministic, hallucination-free catalog replies.
* **Attributed and Truncated Context**: Deduplicates documents, attaches clear source files (e.g. `[Document Source: products.json]`), and limits context size to `2500` characters.

### 3. Guest Session Management
* Supports anonymous users by generating UUID sessions and saving conversation histories in-memory (`guest_session_store.py`), bypassing Supabase authenticated constraints for guest interactions.

### 4. Search Latency & Analytics Tracking
* Saves every search request to `data/retrieval_analytics.jsonl` containing the original query, expanded query, classification, document IDs, individual match scores, and search latency.

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env` and fill in the values:
```bash
# General
PROJECT_NAME="Indhulya AI Assistant Backend"

# Supabase (For authenticated users)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Groq LLM Configuration
GROQ_API_KEY="gsk_..."
GROQ_MODEL="llama-3.1-8b-instant"
LLM_TEMPERATURE=0.0

# Retrieval Strategy Options
RAG_MAX_RESULTS=3
RAG_MIN_SCORE_THRESHOLD=0.01
RAG_ENABLE_METADATA_FILTERING=true
RAG_ENABLE_SYNONYM_EXPANSION=true
RAG_ENABLE_QUERY_CLASSIFICATION=true
```

---

## 🚀 Setup & Launch

1. **Create and Activate a Virtual Environment**:
   ```bash
   python -m venv venv
   # Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # Linux/macOS:
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will run on `http://127.0.0.1:8000`.

---

## 🔌 API Endpoints

- **GET `/`**: Welcome status message.
- **GET `/health`**: Returns application live state `{"status": "ok"}`.
- **POST `/chat`**: Submits a message to the assistant.
  - **Request**:
    ```json
    {
      "message": "Do you sell gold rings?",
      "session_id": null
    }
    ```
  - **Response**:
    ```json
    {
      "response": "Yes, we sell the Aura Minimalist Ring made of 18K Yellow Gold...",
      "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
    }
    ```
- **GET `/chat/sessions`**: Lists active chat sessions. (Supports `X-Guest-User-Id` header).
- **POST `/chat/sessions`**: Creates a new session.
- **GET `/chat/sessions/{session_id}`**: Retrieves message history for a specific session.
- **DELETE `/chat/sessions/{session_id}`**: Deletes a session.
- **GET `/docs`**: Interactive Swagger documentation.

---

## 🔍 Offline Evaluation Tool

Inspect query intent, expanded synonyms, and scoring matches offline by running `evaluate_retrieval.py` with a query string:
```bash
venv\Scripts\python.exe evaluate_retrieval.py "22k gold rings"
```

---

## 🧪 Running Tests

Validate RAG, Guest Chats, and prompt grounding using `test_rag_and_guest_chat.py`:
```bash
venv\Scripts\python.exe test_rag_and_guest_chat.py
```
