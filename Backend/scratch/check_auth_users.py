import sys
import os
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.supabase import supabase

def main():
    try:
        print("Fetching auth users using Admin Auth API...")
        response = supabase.auth.admin.list_users()
        # In newer supabase versions, it might return a list or an object
        if hasattr(response, 'users'):
            users = response.users
        else:
            users = response
            
        print(f"Number of users found: {len(users)}")
        for i, u in enumerate(users):
            print(f"User {i+1} -> ID: {u.id}, Email: {u.email}")
    except Exception as e:
        print("Error listing auth users:", str(e))

if __name__ == "__main__":
    main()
