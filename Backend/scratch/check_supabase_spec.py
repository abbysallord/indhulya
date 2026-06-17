import os
import sys
import requests
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.settings import settings

def main():
    url = f"{settings.SUPABASE_URL}/rest/v1/"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"
    }
    
    print(f"Fetching Supabase PostgREST API spec from: {url}")
    try:
        r = requests.get(url, headers=headers)
        r.raise_for_status()
        spec = r.json()
        
        definitions = spec.get("definitions", {})
        print(f"Total tables found in API schema: {list(definitions.keys())}")
        
        if "profiles" in definitions:
            print("\nColumns detected in 'profiles' table:")
            properties = definitions["profiles"].get("properties", {})
            for col, details in properties.items():
                print(f"  - {col} ({details.get('type')})")
        else:
            print("\nWARNING: 'profiles' table is NOT found in the schema definitions!")
            
    except Exception as e:
        print("Error fetching schema spec:", str(e))

if __name__ == "__main__":
    main()
