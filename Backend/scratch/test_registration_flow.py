import sys
import os
import uuid
import requests
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.supabase import supabase

def main():
    backend_url = "http://localhost:8000"
    random_suffix = uuid.uuid4().hex[:6]
    email = f"vicky.test.local+{random_suffix}@gmail.com"
    password = "MySecurePassword123!"
    full_name = "Vicky Custom Auth"
    
    print(f"--- 1. Testing Registration API ({email}) ---")
    payload = {
        "full_name": full_name,
        "email": email,
        "password": password
    }
    
    try:
        r = requests.post(f"{backend_url}/auth/register", json=payload)
        print("Registration Status:", r.status_code)
        print("Registration Response:", r.json())
        r.raise_for_status()
        user_id = r.json().get("user_id")
    except Exception as e:
        print("Error calling register API:", str(e))
        return
        
    print(f"\n--- 2. Testing Login API ({email}) ---")
    login_payload = {
        "email": email,
        "password": password
    }
    try:
        r = requests.post(f"{backend_url}/auth/login", json=login_payload)
        print("Login Status:", r.status_code)
        print("Login Response:", r.json())
        r.raise_for_status()
        token = r.json().get("access_token")
    except Exception as e:
        print("Error calling login API:", str(e))
        return
        
    print(f"\n--- 3. Testing Authenticated Route with Mock Token ({token}) ---")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    session_payload = {
        "title": "Test Auth Session"
    }
    try:
        r = requests.post(f"{backend_url}/chat/sessions", json=session_payload, headers=headers)
        print("Create Session Status:", r.status_code)
        print("Create Session Response:", r.json())
        r.raise_for_status()
        session_id = r.json().get("id")
        print("SUCCESS! Created authenticated session successfully!")
    except Exception as e:
        print("Error calling authenticated endpoint:", str(e))
        print("This is expected if the 'profiles' or 'chat_sessions' table hasn't been created on Supabase yet.")
        return

    # Cleanup the test session (optional)
    try:
        r = requests.delete(f"{backend_url}/chat/sessions/{session_id}", headers=headers)
        print("Cleanup session response:", r.status_code)
    except Exception as e:
        print("Cleanup failed:", str(e))

if __name__ == "__main__":
    main()
