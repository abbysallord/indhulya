# AI Chatbot Backend

Production-ready, modular base backend structure for a scalable AI chatbot service built using FastAPI, Pydantic, and Supabase.

## 📁 Folder Structure

```text
backend/
│
├── app/
│   ├── main.py              # Application entrypoint & middleware setup
│   │
│   ├── core/
│   │   ├── config.py        # Logging setups and app configurations
│   │   └── settings.py      # BaseSettings for environment variables validation
│   │
│   ├── api/
│   │   └── routes/          # Router paths mapping HTTP requests to services
│   │       ├── chat.py      # Chat routing mapping POST /chat
│   │       └── health.py    # Health check mapping GET /health
│   │
│   ├── db/
│   │   ├── supabase.py      # Supabase client instantiation
│   │   └── queries.py       # SQL query functions & query builder placeholders
│   │
│   ├── schemas/
│   │   └── chat.py          # Pydantic data schemas for request/response validation
│   │
│   ├── services/
│   │   └── chat_service.py  # Chat processing business logic layer
│   │
│   └── utils/
│       └── helpers.py       # Utility helper functions
│
├── requirements.txt         # Project package dependencies
├── .env.example             # Configuration setup template
└── README.md                # Project README documentation
```

## ⚙️ Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure settings:
   - `SUPABASE_URL`: Your Supabase Project API URL.
   - `SUPABASE_KEY`: Your Supabase Service Role or Anon key.
   - `GROK_API_KEY`: Grok AI API keys (for future implementation).

## 🚀 Setup & Launch

1. Create a Python Virtual Environment:
   ```bash
   python -m venv venv
   # Activate on Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # Activate on Linux/macOS:
   source venv/bin/activate
   ```
2. Install Required Dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## 🔌 API Endpoints

- **GET `/`**: Welcome details & link to documentation.
- **GET `/health`**: Returns application status `{"status": "ok"}`.
- **POST `/chat`**: Processes chat requests.
  - **Request Body**:
    ```json
    {
      "session_id": "optional-uuid-string",
      "message": "user query content"
    }
    ```
  - **Response Body**:
    ```json
    {
      "response": "assistant reply text",
      "session_id": "active-uuid-string"
    }
    ```
- **GET `/docs`**: Interactive Swagger UI API documentation.
- **GET `/redoc`**: ReDoc API documentation.
