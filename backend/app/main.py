from typing import List
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from .auth import LoginRequest, TokenResponse, create_access_token, get_current_admin, verify_password
from .database import (
    create_project,
    get_active_projects,
    get_all_projects,
    restore_project,
    soft_delete_project,
    update_project,
    upload_image,
    get_unique_tech_stack,
    reorder_projects,
)
from .models import Project, ProjectCreate, ProjectUpdate
from .ai_service import get_ai_response

app = FastAPI(title="E-Portfolio API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://portfolio-492203.web.app",
        "https://portfolio-492203.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Image Upload
# ---------------------------------------------------------------------------

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
MAX_SIZE_MB = 5

@app.post("/api/upload-image")
def upload_project_image(
    file: UploadFile = File(...),
    _: str = Depends(get_current_admin),
) -> dict:
    """Upload a project image to Supabase Storage. Returns { url }."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, WEBP, GIF, SVG")
    data = file.file.read()
    if len(data) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max size is {MAX_SIZE_MB} MB")
    url = upload_image(file.filename or "upload", data, file.content_type)
    return {"url": url}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@app.post("/api/auth/login", response_model=TokenResponse)
def login(body: LoginRequest) -> TokenResponse:
    if not verify_password(body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )
    return TokenResponse(access_token=create_access_token())


# ---------------------------------------------------------------------------
# Projects — Public
# ---------------------------------------------------------------------------

@app.get("/api/projects", response_model=List[Project])
def get_projects() -> List[Project]:
    """Public endpoint — returns only isActive=1 projects."""
    rows = get_active_projects()
    return [Project(**row) for row in rows]


# ---------------------------------------------------------------------------
# Projects — Admin (JWT required)
# ---------------------------------------------------------------------------

@app.get("/api/projects/all", response_model=List[Project])
def get_projects_all(_: str = Depends(get_current_admin)) -> List[Project]:
    """Admin: returns all projects including inactive ones."""
    rows = get_all_projects()
    return [Project(**row) for row in rows]


@app.post("/api/projects", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_new_project(
    body: ProjectCreate, _: str = Depends(get_current_admin)
) -> Project:
    data = body.model_dump(exclude_none=False)
    # Automatically set order to the end of the list
    existing = get_all_projects()
    data["order"] = len(existing) 
    row = create_project(data)
    return Project(**row)


@app.put("/api/projects/{project_id}", response_model=Project)
def edit_project(
    project_id: str,
    body: ProjectUpdate,
    _: str = Depends(get_current_admin),
) -> Project:
    data = body.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    row = update_project(project_id, data)
    return Project(**row)


@app.delete("/api/projects/{project_id}", response_model=Project)
def delete_project(
    project_id: str, _: str = Depends(get_current_admin)
) -> Project:
    """Soft-delete: sets isActive=0."""
    row = soft_delete_project(project_id)
    return Project(**row)


@app.patch("/api/projects/{project_id}/restore", response_model=Project)
def restore_project_endpoint(
    project_id: str, _: str = Depends(get_current_admin)
) -> Project:
    """Restore a soft-deleted project: sets isActive=1."""
    row = restore_project(project_id)
    return Project(**row)


@app.get("/api/tech-tags", response_model=List[str])
def get_tech_tags(_: str = Depends(get_current_admin)) -> List[str]:
    """Admin: returns a unique list of all tech stack items across all projects."""
    return get_unique_tech_stack()


@app.post("/api/projects/reorder")
def reorder_projects_endpoint(
    ordered_ids: List[str], _: str = Depends(get_current_admin)
) -> dict:
    """Admin: update project ordering in bulk."""
    reorder_projects(ordered_ids)
    return {"status": "success"}
from fastapi import Request
from datetime import datetime, date

# Simple in-memory rate limiting: { ip: { count: int, last_reset: date } }
AI_RATE_LIMIT = 5
ai_query_counts = {}

def check_rate_limit(request: Request) -> int:
    ip = request.client.host
    today = date.today()
    
    if ip not in ai_query_counts or ai_query_counts[ip]["last_reset"] != today:
        ai_query_counts[ip] = {"count": 0, "last_reset": today}
    
    return AI_RATE_LIMIT - ai_query_counts[ip]["count"]

def increment_rate_limit(request: Request):
    ip = request.client.host
    ai_query_counts[ip]["count"] += 1

# ---------------------------------------------------------------------------
# AI Query
# ---------------------------------------------------------------------------

@app.get("/api/ai/limit")
def get_ai_limit(request: Request) -> dict:
    """Returns the remaining query count for the user."""
    remaining = check_rate_limit(request)
    return {"remaining": max(0, remaining), "limit": AI_RATE_LIMIT}

@app.post("/api/ai/query")
def ai_query(request: Request, body: dict) -> dict:
    """Public AI query endpoint with rate limiting."""
    remaining = check_rate_limit(request)
    if remaining <= 0:
        raise HTTPException(
            status_code=429, 
            detail="Daily AI query limit reached. Please come back tomorrow!"
        )
    
    user_query = body.get("query")
    if not user_query:
        raise HTTPException(400, "Query is required")
    
    if len(user_query) > 300:
        raise HTTPException(400, "Query too long. Max 300 characters.")
    
    # Fetch projects for context
    projects = get_active_projects()
    context_str = ""
    for p in projects:
        context_str += f"- Title: {p['title']}\n  Description: {p['shortDescription']}\n  Tech: {', '.join(p['techStack'])}\n\n"
    
    response = get_ai_response(user_query, context_str)
    
    # Increment after successful response
    increment_rate_limit(request)
    
    return {
        "response": response, 
        "remaining": max(0, remaining - 1)
    }

# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

from .database import get_profile_data, update_profile_data

@app.get("/api/profile")
def get_profile() -> dict:
    """Public endpoint to fetch portfolio profile/header data."""
    return get_profile_data()

@app.put("/api/profile")
def update_profile(
    body: dict, 
    _: str = Depends(get_current_admin)
) -> dict:
    """Admin endpoint to update portfolio profile/header data."""
    return update_profile_data(body)
