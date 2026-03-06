from typing import List
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .auth import LoginRequest, TokenResponse, create_access_token, get_current_admin, verify_password
from .database import (
    create_project,
    get_active_projects,
    get_all_projects,
    restore_project,
    soft_delete_project,
    update_project,
)
from .models import Project, ProjectCreate, ProjectUpdate

app = FastAPI(title="E-Portfolio API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
