import sys
import os
import logging
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Enable debug logging to see full network output
logging.basicConfig(level=logging.DEBUG)

from app.services.lead_service import LeadService
from app.db import queries

def main():
    print("Testing LeadService.create_lead_record directly...")
    lead = LeadService.create_lead_record(
        user_id=None,
        session_id="test_direct_session_id",
        name="Vicky Direct",
        phone="9876543210",
        email=None,
        slots={"category": "Ring", "material": "18k-gold"},
        history=[],
        current_message="I want to buy a gold ring",
        assistant_reply="processing..."
    )
    if lead:
        print("\nSUCCESS! Created lead in Supabase:")
        print(lead)
    else:
        print("\nFAILED to create lead. Check the logs above for HTTP/DB errors.")

if __name__ == "__main__":
    main()
