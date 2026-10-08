# ==============================================================================
# routes/tasks.py — CRUD Endpoints for the Task Resource
# ==============================================================================
# Endpoint map:
#
#   GET    /api/tasks          → list all tasks (optional ?status= filter)
#   POST   /api/tasks          → create a new task
#   GET    /api/tasks/{id}     → fetch one task by ID
#   PUT    /api/tasks/{id}     → update a task (partial or full)
#   DELETE /api/tasks/{id}     → delete a task permanently
#
# Each route:
#   1. Receives a validated request (Pydantic rejects bad input before this runs)
#   2. Calls a service function (never writes SQL inline)
#   3. Returns a typed response (Pydantic serialises the ORM object)
# ==============================================================================

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.task import TaskStatus
from app.schemas.task import TaskCreate, TaskListResponse, TaskResponse, TaskUpdate
from app.services import task_service

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


# ==============================================================================
# HELPER
# ==============================================================================

def _get_task_or_404(task_id: int, db: Session) -> object:
    """
    Fetch a task by ID. Raise 404 if not found.

    Centralised here so every route that needs a task uses the same lookup
    and error message — no duplicated if-task-is-None checks.
    """
    task = task_service.get_task_by_id(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id={task_id} not found",
        )
    return task


# ==============================================================================
# GET /api/tasks
# ==============================================================================

@router.get(
    "/",
    response_model=TaskListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all tasks",
    description=(
        "Returns all tasks ordered by newest first. "
        "Pass `?status=pending` or `?status=completed` to filter."
    ),
)
def list_tasks(
    status_filter: Optional[TaskStatus] = Query(
        default=None,
        alias="status",
        description="Filter tasks by status: 'pending' or 'completed'",
    ),
    db: Session = Depends(get_db),
) -> TaskListResponse:
    """
    ## GET /api/tasks

    **Purpose:** Retrieve all tasks, optionally filtered by status.

    **Query params:**
    - `status` (optional): `pending` | `completed`

    **Response:** `TaskListResponse` — a list of tasks plus a count.

    **Errors:** None (empty list is a valid 200 response).
    """
    tasks = task_service.get_tasks(db, status=status_filter)
    return TaskListResponse(tasks=tasks, count=len(tasks))


# ==============================================================================
# POST /api/tasks
# ==============================================================================

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Creates a task with the provided title, optional description, and status.",
)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    ## POST /api/tasks

    **Purpose:** Create a new task and persist it to PostgreSQL.

    **Request body:** `TaskCreate`
    - `title` (required): 1–100 chars
    - `description` (optional): max 500 chars
    - `status` (optional): `"pending"` (default) | `"completed"`

    **Response:** `TaskResponse` — the created task with its auto-assigned id and timestamps.

    **HTTP 201 Created** — the standard success code for resource creation.

    **Errors:**
    - `422 Unprocessable Entity` — title missing, title too long, invalid status value
    """
    task = task_service.create_task(db, task_in)
    return task


# ==============================================================================
# GET /api/tasks/{id}
# ==============================================================================

@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a single task by ID",
    description="Returns the task with the given ID. Returns 404 if not found.",
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    ## GET /api/tasks/{id}

    **Purpose:** Fetch one specific task by its primary key.

    **Path param:** `task_id` (integer)

    **Response:** `TaskResponse` — full task object.

    **Errors:**
    - `404 Not Found` — no task with that id exists
    - `422 Unprocessable Entity` — task_id is not an integer (e.g. `/api/tasks/abc`)
    """
    return _get_task_or_404(task_id, db)


# ==============================================================================
# PUT /api/tasks/{id}
# ==============================================================================

@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a task",
    description=(
        "Update any combination of title, description, or status. "
        "Fields not included in the request body are left unchanged."
    ),
)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    ## PUT /api/tasks/{id}

    **Purpose:** Modify one or more fields of an existing task.

    **Path param:** `task_id` (integer)

    **Request body:** `TaskUpdate` — all fields optional:
    - `title`: new title (1–100 chars)
    - `description`: new description (max 500 chars)
    - `status`: `"pending"` | `"completed"`

    Send only the fields you want to change. Omitted fields keep their current value.

    **Response:** `TaskResponse` — the updated task.

    **Errors:**
    - `404 Not Found` — task does not exist
    - `422 Unprocessable Entity` — validation failed (title empty, status invalid, etc.)
    """
    db_task = _get_task_or_404(task_id, db)
    return task_service.update_task(db, db_task, task_in)


# ==============================================================================
# DELETE /api/tasks/{id}
# ==============================================================================

@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
    description="Permanently deletes the task with the given ID. Returns 204 No Content on success.",
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> None:
    """
    ## DELETE /api/tasks/{id}

    **Purpose:** Permanently remove a task from the database.

    **Path param:** `task_id` (integer)

    **Response:** `204 No Content` — no body; the resource no longer exists.

    **HTTP 204** is the standard success code for deletions (not 200,
    because there is nothing left to return in the body).

    **Errors:**
    - `404 Not Found` — task does not exist (already deleted or never existed)
    """
    db_task = _get_task_or_404(task_id, db)
    task_service.delete_task(db, db_task)
