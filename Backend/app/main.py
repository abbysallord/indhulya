from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.config import PROJECT_NAME, API_V1_STR
from app.core.settings import settings
from app.core.limiter import limiter
from app.api.routes import chat, health, auth

# Create the FastAPI app instance
app = FastAPI(
    title=PROJECT_NAME,
    description="Production-ready base API backend structure for AI Chatbot System.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS Middleware to enable communication with the Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint to confirm backend is reachable
@app.get("/")
def read_root():
    return {
        "message": f"Welcome to the {PROJECT_NAME} API!",
        "docs_url": "/docs"
    }

# Mount modular routes
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
