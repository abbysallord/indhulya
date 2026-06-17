import sys
import os
import uuid
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.supabase import supabase

def main():
    print("Testing insert into leads table...")
    lead_data = {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "session_id": "test_session_id",
        "name": "Test Dinesh",
        "phone": "99999999",
        "email": None,
        "interested_products": [],
        "budget": "Not specified",
        "material_preference": None,
        "occasion": None,
        "conversation_summary": "Test conversation summary",
        "lead_source": "chatbot",
        "status": "captured"
    }
    try:
        response = supabase.table("leads").insert(lead_data).execute()
        print("Success! Inserted row details:")
        print(response.data)
    except Exception as e:
        print("Error inserting lead:", str(e))

if __name__ == "__main__":
    main()
