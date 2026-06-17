import sys
import os
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.supabase import supabase

def main():
    print("Connecting to Supabase and fetching leads...")
    try:
        response = supabase.table("leads").select("*").order("created_at", desc=True).limit(5).execute()
        print(f"Fetch completed. Number of rows found: {len(response.data)}")
        for i, row in enumerate(response.data):
            print(f"\n--- Lead {i+1} ---")
            print(f"ID: {row.get('id')}")
            print(f"Name: {row.get('name')}")
            print(f"Phone: {row.get('phone')}")
            print(f"Email: {row.get('email')}")
            print(f"Budget: {row.get('budget')}")
            print(f"Material Preference: {row.get('material_preference')}")
            print(f"Occasion: {row.get('occasion')}")
            print(f"Summary: {row.get('conversation_summary')}")
            print(f"Interested Products: {row.get('interested_products')}")
            print(f"Created At: {row.get('created_at')}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
