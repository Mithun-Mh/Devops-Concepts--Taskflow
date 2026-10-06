from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime

try:
    # pyrefly: ignore [missing-import]
    from ..database import Base
except (ImportError, ValueError):
    from app.database import Base


class Task(Base):
    """
    SQLAlchemy database model for Task entities.
    Maps directly to PostgreSQL / relational database table 'tasks'.
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="TODO", nullable=False, index=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
