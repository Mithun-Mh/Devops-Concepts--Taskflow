# ==============================================================================
# tests/test_task_service.py — Unit Tests for Database Service Layer
# ==============================================================================
# Demonstrates unit testing: tests individual Python functions in isolation
# without going through FastAPI HTTP routing or network serialization.
# ==============================================================================

from sqlalchemy.orm import Session

from app.models.task import TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate
from app.services import task_service


def test_unit_create_and_get_task(db_session: Session):
    """
    Unit test: create_task writes a Task entity to the database
    and get_task_by_id retrieves it accurately.
    """
    task_in = TaskCreate(
        title="Unit Test Task",
        description="Testing task_service directly",
        status=TaskStatus.in_progress,
    )
    created = task_service.create_task(db_session, task_in)

    assert created.id is not None
    assert created.title == "Unit Test Task"
    assert created.status == TaskStatus.in_progress

    fetched = task_service.get_task_by_id(db_session, created.id)
    assert fetched is not None
    assert fetched.id == created.id


def test_unit_update_task(db_session: Session):
    """
    Unit test: update_task mutates task fields and persists updates.
    """
    task = task_service.create_task(
        db_session, TaskCreate(title="Original", status=TaskStatus.pending)
    )

    update_in = TaskUpdate(title="Modified", status=TaskStatus.completed)
    updated = task_service.update_task(db_session, task, update_in)

    assert updated.title == "Modified"
    assert updated.status == TaskStatus.completed


def test_unit_delete_task(db_session: Session):
    """
    Unit test: delete_task removes the task row from the session.
    """
    task = task_service.create_task(db_session, TaskCreate(title="To be removed"))
    task_id = task.id

    task_service.delete_task(db_session, task)
    assert task_service.get_task_by_id(db_session, task_id) is None
