import sys
import os
from pathlib import Path

# Adjust path to import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.supabase import supabase

def main():
    print("Connecting to Supabase and checking all tables...")
    tables = [
        "chat_sessions",
        "chat_messages",
        "user_preferences",
        "conversation_state",
        "leads",
        "recommendation_history"
    ]
    
    for t in tables:
        print(f"\n=================== Table: {t} ===================")
        try:
            # Query table data
            response = supabase.table(t).select("*").limit(5).execute()
            data = response.data
            print(f"Total retrieved (limit 5): {len(data)}")
            if len(data) == 0:
                print("No rows found.")
            for i, row in enumerate(data):
                print(f"\n--- Row {i+1} ---")
                for k, v in row.items():
                    print(f"  {k}: {v}")
        except Exception as e:
            print(f"Error checking table {t}: {str(e)}")

if __name__ == "__main__":
    main()
