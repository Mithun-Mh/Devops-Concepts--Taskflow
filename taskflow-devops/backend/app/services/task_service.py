# ==============================================================================
# services/task_service.py — Database Operations for Tasks
# ==============================================================================
# This layer contains all SQLAlchemy queries for the Task resource.
# Routes call these functions; they never write raw SQL themselves.
#
# Keeping DB logic here (instead of inline in routes) makes it easy to:
#   - test queries in isolation
#   - swap the DB engine without touching route logic
# ==============================================================================

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate


def get_tasks(db: Session, status: Optional[TaskStatus] = None) -> List[Task]:
    """
    Return all tasks, optionally filtered by status.

    ORDER BY id DESC means newest tasks appear first.
    Filtering happens inside the DB (WHERE clause) — not in Python — so it
    scales to millions of rows without loading them all into memory.
    """
    query = db.query(Task)
    if status is not None:
        query = query.filter(Task.status == status)
    return query.order_by(Task.id.desc()).all()


def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
    """
    Return one task by primary key, or None if not found.
    The route is responsible for raising 404 when None is returned.
    """
    return db.query(Task).filter(Task.id == task_id).first()


def create_task(db: Session, task_in: TaskCreate) -> Task:
    """
    Insert a new task row and return the fully-populated ORM object.

    db.refresh(db_task) re-reads the row from PostgreSQL so that
    server-generated values (id, created_at, updated_at) are populated
    on the Python object before it is returned to the route.
    """
    db_task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,   # same enum — no coercion needed
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, db_task: Task, task_in: TaskUpdate) -> Task:
    """
    Apply partial updates to an existing task and return the updated object.

    model_dump(exclude_unset=True) returns only the fields the client
    explicitly sent — absent fields are NOT overwritten with None.
    Example: PUT {"status": "completed"} leaves title and description unchanged.
    """
    update_data = task_in.model_dump(exclude_unset=True)   # Pydantic v2 API
    for field, value in update_data.items():
        setattr(db_task, field, value)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, db_task: Task) -> None:
    """
    Delete a task row permanently. The route verifies the task exists first.
    """
    db.delete(db_task)
    db.commit()

