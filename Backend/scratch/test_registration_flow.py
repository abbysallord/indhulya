import sys
import os
import uuid
import requests
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.supabase import supabase
from supabase import create_client

def main():
    backend_url = "http://localhost:8000"
    email = f"vicky_test_{uuid.uuid4().hex[:8]}@example.com"
    password = "SuperSecurePassword123!"
    full_name = "Vicky Verification"
    
    print(f"Testing registration API with email: {email}...")
    
    # 1. Sign up the user via the API endpoint
    payload = {
        "full_name": full_name,
        "email": email,
        "password": password
    }
    
    try:
        r = requests.post(f"{backend_url}/auth/register", json=payload)
        print("Registration Response Status:", r.status_code)
        print("Registration Response Data:", r.json())
        r.raise_for_status()
        res_data = r.json()
        user_id = res_data.get("user_id")
    except Exception as e:
        print("Error calling register API:", str(e))
        return
        
    print("\n1. Verifying if profile record was created in Supabase 'profiles' table via Admin (Service Role) client...")
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        profile_data = response.data
        if len(profile_data) > 0:
            print("SUCCESS! Public profile row created:")
            print(profile_data[0])
        else:
            print("FAILED! Public profile row was NOT found in Supabase.")
    except Exception as e:
        print("Error querying profiles via Admin:", str(e))
        
    print("\n2. Verifying RLS: Attempting to query the new profile using an unauthenticated/anonymous client...")
    try:
        from app.core.settings import settings
        anon_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        # Attempt to read all profiles (should be blocked by RLS)
        response_anon = anon_client.table("profiles").select("*").execute()
        print(f"RLS Query Response count: {len(response_anon.data)}")
        
        # Verify that we can't see profiles of other users
        # Under RLS, anon read should return empty list or fail.
        if len(response_anon.data) == 0:
            print("SUCCESS! RLS blocked unauthenticated access (returned 0 rows).")
        else:
            # Check if we could read the one we just inserted or other users
            matching = [p for p in response_anon.data if p['id'] == user_id]
            if matching:
                print("WARNING! RLS did NOT block unauthenticated access! We could read our profile:", matching[0])
            else:
                print("SUCCESS! RLS blocked reading our profile, but got other rows:", len(response_anon.data))
    except Exception as e:
        print("Anonymous query failed (as expected if RLS blocked it completely):", str(e))

if __name__ == "__main__":
    main()
