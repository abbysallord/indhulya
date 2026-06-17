import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.db.models import Lead
from app.core.config import logger

class LeadService:
    @staticmethod
    def create_authenticated_lead(db: Session, user_id: str, user_email: str, user_metadata: dict, session_id: Optional[str]) -> Lead:
        """
        Automatically creates a lead record for logged-in users using profile attributes.
        """
        try:
            # Check if lead record already exists for this session
            existing_lead = db.query(Lead).filter(Lead.session_id == session_id).first()
            if existing_lead:
                return existing_lead
                
            name = user_metadata.get("name") or user_metadata.get("full_name") or user_email.split("@")[0].capitalize()
            phone = user_metadata.get("phone")
            
            lead = Lead(
                id=str(uuid.uuid4()),
                user_id=user_id,
                session_id=session_id,
                name=name,
                email=user_email,
                phone=phone,
                status="captured"
            )
            db.add(lead)
            db.commit()
            db.refresh(lead)
            logger.info(f"Automatically captured lead {lead.id} for authenticated user {user_id}.")
            return lead
        except Exception as e:
            logger.error(f"Failed to automatically capture authenticated lead: {str(e)}")
            return None

    @staticmethod
    def create_guest_lead(db: Session, session_id: str, name: str, phone: str) -> Lead:
        """
        Creates or updates a lead record for anonymous guest sessions.
        """
        try:
            existing_lead = db.query(Lead).filter(Lead.session_id == session_id).first()
            if existing_lead:
                # Update guest details if new ones are provided
                if name:
                    existing_lead.name = name
                if phone:
                    existing_lead.phone = phone
                db.commit()
                db.refresh(existing_lead)
                logger.info(f"Updated guest lead details for session {session_id}.")
                return existing_lead
                
            lead = Lead(
                id=str(uuid.uuid4()),
                user_id=None,
                session_id=session_id,
                name=name,
                email=None,
                phone=phone,
                status="captured"
            )
            db.add(lead)
            db.commit()
            db.refresh(lead)
            logger.info(f"Captured guest lead {lead.id} for session {session_id}.")
            return lead
        except Exception as e:
            logger.error(f"Failed to capture guest lead: {str(e)}")
            return None
