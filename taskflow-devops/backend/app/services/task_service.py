from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    """
    Encapsulates business logic and database interactions for Tasks.
    Separating services from routes ensures clean testability and code organization.
    """

    @staticmethod
    def get_tasks(db: Session, status: Optional[str] = None) -> List[Task]:
        query = db.query(Task)
        if status:
            query = query.filter(Task.status == status)
        return query.order_by(Task.id.desc()).all()

    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def create_task(db: Session, task_in: TaskCreate) -> Task:
        db_task = Task(
            title=task_in.title,
            description=task_in.description,
            status=task_in.status.value if hasattr(task_in.status, "value") else task_in.status,
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def update_task(db: Session, db_task: Task, task_in: TaskUpdate) -> Task:
        update_data = task_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "status" and hasattr(value, "value"):
                value = value.value
            setattr(db_task, field, value)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def delete_task(db: Session, db_task: Task) -> None:
        db.delete(db_task)
        db.commit()
