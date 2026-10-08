# ==============================================================================
# schemas/task.py — Pydantic Request & Response Schemas for Tasks
# ==============================================================================
# Pydantic schemas serve three purposes:
#   1. REQUEST VALIDATION  — reject bad input before it reaches the DB
#   2. RESPONSE SHAPING    — control exactly which fields the API returns
#   3. DOCUMENTATION       — FastAPI auto-generates Swagger from these types
#
# These schemas are intentionally separate from the SQLAlchemy model (Task).
# The model owns the DB layout; these schemas own the API contract.
# ==============================================================================

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

# Import the canonical enum from the ORM model so BOTH the DB layer and API
# layer share one source of truth for valid status values.
# This prevents the two-enum-drift bug (schema says "TODO", DB says "pending").
from app.models.task import TaskStatus


# ==============================================================================
# REQUEST SCHEMAS
# ==============================================================================

class TaskCreate(BaseModel):
    """
    Schema for POST /api/tasks — creating a new task.

    Fields are validated by Pydantic before they ever reach the database:
      - title:       required, 1–100 chars (empty string rejected)
      - description: optional, max 500 chars
      - status:      optional, defaults to "pending"
    """
    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Short title for the task (required, max 100 chars)",
        examples=["Deploy staging environment"],
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional longer description (max 500 chars)",
        examples=["Push the latest Docker image to the staging cluster"],
    )
    status: TaskStatus = Field(
        default=TaskStatus.pending,
        description="Initial status — 'pending' or 'completed'",
    )


class TaskUpdate(BaseModel):
    """
    Schema for PUT /api/tasks/{id} — update any writable fields on a task.

    Every field is Optional so the client sends only what it wants to change.
    The route uses model.model_dump(exclude_unset=True) to detect which fields
    were explicitly provided — avoids overwriting fields with None accidentally.
    """
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="New title (1–100 chars)",
        examples=["Deploy production environment"],
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="New description",
        examples=["Push the Docker image to the production cluster"],
    )
    status: Optional[TaskStatus] = Field(
        None,
        description="New status — 'pending' or 'completed'",
    )


# ==============================================================================
# RESPONSE SCHEMAS
# ==============================================================================

class TaskResponse(BaseModel):
    """
    Schema for a single task returned in any API response.

    from_attributes=True tells Pydantic to read values from SQLAlchemy ORM
    object attributes (e.g. task.title) instead of dict keys.
    Without this, TaskResponse.model_validate(orm_task) would raise an error.
    """
    id: int = Field(..., description="Auto-assigned unique task ID")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    status: TaskStatus = Field(..., description="Current status")
    created_at: datetime = Field(..., description="UTC timestamp when task was created")
    updated_at: datetime = Field(..., description="UTC timestamp when task was last updated")

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    """
    Wrapper for GET /api/tasks — list of tasks plus a total count.
    The count field saves clients a second request to know how many tasks exist.
    """
    tasks: List[TaskResponse]
    count: int = Field(..., description="Total number of tasks returned")
