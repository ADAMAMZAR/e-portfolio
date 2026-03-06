from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl


class Category(str, Enum):
    fullstack = "fullstack"
    frontend = "frontend"
    backend = "backend"
    ml = "ml"
    other = "other"


class Project(BaseModel):
    id: UUID
    title: str = Field(max_length=60)
    shortDescription: str = Field(max_length=140)
    description: str
    techStack: List[str] = Field(max_length=8)
    imageUrl: str
    placeholderColor: str
    demoLink: Optional[str] = None
    repoLink: Optional[str] = None
    featured: bool
    isConfidential: bool
    category: Category
    year: int = Field(ge=2000, le=2100)
    order: int = Field(ge=0)
    isActive: int = Field(default=1)


class ProjectCreate(BaseModel):
    title: str = Field(max_length=60)
    shortDescription: str = Field(max_length=140)
    description: str
    techStack: List[str] = Field(max_length=8)
    imageUrl: str
    placeholderColor: str = "#1e293b"
    demoLink: Optional[str] = None
    repoLink: Optional[str] = None
    featured: bool = False
    isConfidential: bool = False
    category: Category = Category.other
    year: int = Field(ge=2000, le=2100)
    order: int = Field(ge=0, default=0)
    isActive: int = Field(default=1)


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=60)
    shortDescription: Optional[str] = Field(default=None, max_length=140)
    description: Optional[str] = None
    techStack: Optional[List[str]] = Field(default=None, max_length=8)
    imageUrl: Optional[str] = None
    placeholderColor: Optional[str] = None
    demoLink: Optional[str] = None
    repoLink: Optional[str] = None
    featured: Optional[bool] = None
    isConfidential: Optional[bool] = None
    category: Optional[Category] = None
    year: Optional[int] = Field(default=None, ge=2000, le=2100)
    order: Optional[int] = Field(default=None, ge=0)
    isActive: Optional[int] = None
