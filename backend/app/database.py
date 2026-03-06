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
