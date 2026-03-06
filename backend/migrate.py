"""
One-shot migration script: creates the projects table in Supabase and seeds
existing JSON projects.  Run once from the backend directory:
    python migrate.py
"""
import sys, json, os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

# Load existing projects from JSON
data_path = Path(__file__).parent / "app" / "data" / "projects.json"
with data_path.open() as f:
    projects = json.load(f)

# Add isActive=1 to all existing projects
for p in projects:
    p["isActive"] = 1

print(f"Seeding {len(projects)} projects into Supabase...")

try:
    result = client.table("projects").upsert(projects, on_conflict="id").execute()
    print(f"Done! {len(result.data)} rows upserted.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
