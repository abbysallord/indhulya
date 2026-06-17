import sys
import os
import requests
import uuid
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.supabase import supabase

def main():
    backend_url = "http://localhost:8000"
    print(f"Testing chat endpoint at {backend_url}...")
    
    # 1. GREETING/DISCOVERY
    payload = {
        "message": "Hello, I am looking for a ring.",
        "session_id": None,
        "history": []
    }
    
    try:
        r = requests.post(f"{backend_url}/chat", json=payload)
        r.raise_for_status()
        res_data = r.json()
        session_id = res_data.get("session_id")
        response_text = res_data.get("response")
        print(f"\nStep 1 (Intro) -> Session ID: {session_id}")
        print(f"Bot Response: {response_text}")
    except Exception as e:
        print(f"Error calling backend at Step 1: {str(e)}")
        return

    # 2. TRIGGER PURCHASE INTENT
    history = [
        {"role": "user", "content": payload["message"]},
        {"role": "assistant", "content": response_text}
    ]
    payload2 = {
        "message": "I want to buy the Aura Minimalist Ring",
        "session_id": session_id,
        "history": history
    }
    
    try:
        r = requests.post(f"{backend_url}/chat", json=payload2)
        r.raise_for_status()
        res_data = r.json()
        response_text2 = res_data.get("response")
        print(f"\nStep 2 (Purchase Intent) -> Session ID: {session_id}")
        print(f"Bot Response: {response_text2}")
    except Exception as e:
        print(f"Error calling backend at Step 2: {str(e)}")
        return

    # 3. SHARE NAME AND PHONE
    history.extend([
        {"role": "user", "content": payload2["message"]},
        {"role": "assistant", "content": response_text2}
    ])
    payload3 = {
        "message": "Vicky, 9876543210",
        "session_id": session_id,
        "history": history
    }
    
    try:
        r = requests.post(f"{backend_url}/chat", json=payload3)
        r.raise_for_status()
        res_data = r.json()
        response_text3 = res_data.get("response")
        print(f"\nStep 3 (Provide Details) -> Session ID: {session_id}")
        print(f"Bot Response: {response_text3}")
    except Exception as e:
        print(f"Error calling backend at Step 3: {str(e)}")
        return

    # 4. VERIFY DATA IN SUPABASE
    print("\nVerifying if lead details are stored in Supabase...")
    try:
        # Fetch the most recent lead with this session_id from Supabase
        response = supabase.table("leads").select("*").eq("session_id", session_id).execute()
        leads = response.data
        if len(leads) > 0:
            print(f"Success! Found {len(leads)} lead(s) for session_id '{session_id}' in Supabase.")
            for i, lead in enumerate(leads):
                print(f"--- Lead {i+1} ---")
                print(f"  ID: {lead.get('id')}")
                print(f"  Name: {lead.get('name')}")
                print(f"  Phone: {lead.get('phone')}")
                print(f"  Budget: {lead.get('budget')}")
                print(f"  Material Preference: {lead.get('material_preference')}")
                print(f"  Occasion: {lead.get('occasion')}")
                print(f"  Summary: {lead.get('conversation_summary')}")
                print(f"  Interested Products: {lead.get('interested_products')}")
                print(f"  Created At: {lead.get('created_at')}")
        else:
            print(f"Fail! No leads found for session_id '{session_id}' in Supabase.")
    except Exception as e:
        print(f"Error querying Supabase: {str(e)}")

if __name__ == "__main__":
    main()
