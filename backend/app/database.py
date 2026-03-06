"""
Supabase database helpers using the supabase-py SDK.
All project CRUD operations go through this module.
"""
import os
from typing import Any, Dict, List, Optional
from uuid import UUID

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

_client: Optional[Client] = None

TABLE = "projects"
BUCKET = "project-images"


# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------

def upload_image(filename: str, data: bytes, content_type: str) -> str:
    """Upload an image to Supabase Storage and return its public URL."""
    import uuid as _uuid
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    path = f"{_uuid.uuid4()}.{ext}"
    client = get_client()
    client.storage.from_(BUCKET).upload(
        path,
        data,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return client.storage.from_(BUCKET).get_public_url(path)




def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        _client = create_client(url, key)
    return _client


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

def get_active_projects() -> List[Dict[str, Any]]:
    """Return only isActive=1 projects, sorted for public display."""
    resp = (
        get_client()
        .table(TABLE)
        .select("*")
        .eq("isActive", 1)
        .order("featured", desc=True)
        .order("order", desc=False)
        .execute()
    )
    return resp.data or []


def get_all_projects() -> List[Dict[str, Any]]:
    """Return all projects (admin use)."""
    resp = (
        get_client()
        .table(TABLE)
        .select("*")
        .order("order", desc=False)
        .execute()
    )
    return resp.data or []


def get_unique_tech_stack() -> List[str]:
    """Return a unique list of all tech stack items across all projects."""
    # Supabase-py doesn't have a direct 'unnest' builder, so we use a RPC or just fetch all and process.
    # For a portfolio, fetching all and local processing is fine and simpler than setting up RPC.
    projects = get_all_projects()
    tags = set()
    for p in projects:
        stack = p.get("techStack")
        if stack and isinstance(stack, list):
            for item in stack:
                if item:
                    tags.add(item.strip())
    return sorted(list(tags))



# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def create_project(data: Dict[str, Any]) -> Dict[str, Any]:
    resp = get_client().table(TABLE).insert(data).execute()
    return resp.data[0]


# ---------------------------------------------------------------------------
# Update / Edit
# ---------------------------------------------------------------------------

def update_project(project_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    resp = (
        get_client()
        .table(TABLE)
        .update(data)
        .eq("id", project_id)
        .execute()
    )
    return resp.data[0]


# ---------------------------------------------------------------------------
# Soft-delete / Restore
# ---------------------------------------------------------------------------

def soft_delete_project(project_id: str) -> Dict[str, Any]:
    """Set isActive=0 (soft delete)."""
    return update_project(project_id, {"isActive": 0})


def restore_project(project_id: str) -> Dict[str, Any]:
    """Set isActive=1 (restore)."""
    return update_project(project_id, {"isActive": 1})


def reorder_projects(ordered_ids: List[str]) -> None:
    """Update the 'order' field for all given projects. 
    Uses individual updates to avoid overwriting or null-violation errors if bulk upsert is misused.
    """
    client = get_client()
    for idx, pid in enumerate(ordered_ids):
        client.table(TABLE).update({"order": idx}).eq("id", pid).execute()
