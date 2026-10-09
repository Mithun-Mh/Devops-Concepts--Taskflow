import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SAEnum

try:
    from ..database import Base
except (ImportError, ValueError):
    from app.database import Base


# ==============================================================================
# STATUS ENUM
# ==============================================================================
# Python Enum gives us type-safe status values.
# SQLAlchemy maps this to a ENUM type in PostgreSQL (or VARCHAR on SQLite).
# Only "pending" and "completed" are valid — anything else raises a DB error.
# ==============================================================================
class TaskStatus(str, enum.Enum):
    pending     = "pending"
    in_progress = "in_progress"
    completed   = "completed"


# ==============================================================================
# TASK MODEL  (ORM Model = Database Table Definition)
# ==============================================================================
class Task(Base):
    """
    SQLAlchemy ORM model for the 'tasks' table.

    Each attribute annotated with Column() maps to one column in the table.
    An instance of this class represents a single *row* in that table.

    Concept map
    -----------
    Python class   →  database TABLE
    class instance →  one ROW in the table
    Column()       →  one COLUMN in the table
    primary_key=True → makes 'id' the PRIMARY KEY (unique identifier per row)
    """

    __tablename__ = "tasks"   # The actual table name created in PostgreSQL

    # ------------------------------------------------------------------
    # PRIMARY KEY
    # The primary key uniquely identifies every row.
    # autoincrement=True means PostgreSQL assigns the next integer
    # automatically when a new task is inserted (1, 2, 3 …).
    # ------------------------------------------------------------------
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    # ------------------------------------------------------------------
    # TITLE — required, max 100 chars, indexed for fast text searches
    # ------------------------------------------------------------------
    title = Column(
        String(100),
        nullable=False,
        index=True,
    )

    # ------------------------------------------------------------------
    # DESCRIPTION — optional free-form text (TEXT = unlimited length)
    # ------------------------------------------------------------------
    description = Column(
        Text,
        nullable=True,
    )

    # ------------------------------------------------------------------
    # STATUS — restricted to the TaskStatus enum values
    # default="pending" means every new task starts as pending
    # ------------------------------------------------------------------
    status = Column(
        SAEnum(TaskStatus, name="task_status_enum", create_type=True, values_callable=lambda obj: [e.value for e in obj]),
        default=TaskStatus.pending,
        nullable=False,
        index=True,
    )

    # ------------------------------------------------------------------
    # TIMESTAMPS — set automatically, never require manual input
    # timezone.utc ensures all timestamps are stored in UTC
    # onupdate fires every time the row is modified
    # ------------------------------------------------------------------
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Task id={self.id} title={self.title!r} status={self.status}>"
