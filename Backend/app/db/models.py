from sqlalchemy import Column, String, Float, DateTime, JSON
from app.db.database import Base
from datetime import datetime

class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    # user_id is the primary key. 
    # For authenticated users, it is their Supabase Auth User ID.
    # For guests who give their name, it is a guest identifier or session ID.
    user_id = Column(String, primary_key=True, index=True)
    preferred_materials = Column(JSON, default=list)  # e.g., ["18k-gold"]
    preferred_categories = Column(JSON, default=list)  # e.g., ["Ring"]
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    occasions = Column(JSON, default=list)  # e.g., ["wedding"]
    style_preferences = Column(JSON, default=list)  # e.g., ["minimalist"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, nullable=True, index=True)  # Supabase Auth ID if logged in
    session_id = Column(String, nullable=True, index=True)  # Chat session ID
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, default="captured")  # e.g., "captured", "contacted"
    created_at = Column(DateTime, default=datetime.utcnow)

class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    session_id = Column(String, index=True)
    user_id = Column(String, nullable=True, index=True)
    query = Column(String)
    recommended_products = Column(JSON)  # List of product IDs
    scores = Column(JSON)  # Dict mapping product ID to score
    created_at = Column(DateTime, default=datetime.utcnow)

class ConversationState(Base):
    __tablename__ = "conversation_state"
    
    session_id = Column(String, primary_key=True, index=True)
    state = Column(String, default="GREETING")  # GREETING, DISCOVERY, RECOMMENDATION, COMPARISON, FAQ, POLICY, LEAD_CAPTURE
    context_data = Column(JSON, default=dict)  # Stores accumulated preference slots, guest details, intent, etc.
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
