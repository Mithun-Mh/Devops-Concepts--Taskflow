# ==============================================================================
# database.py — SQLAlchemy Engine & Session Factory
# ==============================================================================
# This module sets up the core database layer:
#   - engine:       the connection pool to PostgreSQL
#   - SessionLocal: factory that creates database sessions
#   - Base:         the declarative base all models inherit from
#   - get_db():     FastAPI dependency that opens/closes a session per request
# ==============================================================================

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator

from app.config import settings

# ==============================================================================
# ENGINE
# ==============================================================================
# The engine is the entry point to the database.  It manages a connection pool
# so that multiple requests can hit the database concurrently without each one
# opening its own raw TCP connection from scratch.
#
# connect_args is empty for PostgreSQL (unlike SQLite which needs
# check_same_thread=False for multi-threaded use).
# ==============================================================================
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.SQL_ECHO,   # Print generated SQL to stdout when True
    pool_pre_ping=True,       # Verify connections are alive before using them
    pool_size=5,              # Number of persistent connections in the pool
    max_overflow=10,          # Extra connections allowed beyond pool_size
)

# ==============================================================================
# SESSION FACTORY
# ==============================================================================
# SessionLocal is a *factory* (a class) — calling SessionLocal() creates a new
# Session object.  Sessions track all the objects you load from / write to the
# database within a single unit of work (a request).
#
# autocommit=False → changes must be explicitly committed (db.commit())
# autoflush=False  → SQLAlchemy won't auto-push changes to the DB mid-session
# ==============================================================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ==============================================================================
# DECLARATIVE BASE
# ==============================================================================
# All SQLAlchemy models inherit from Base.  When Base.metadata.create_all()
# is called, SQLAlchemy inspects every registered model and creates the
# corresponding tables in the database if they don't already exist.
# ==============================================================================
Base = declarative_base()


# ==============================================================================
# SESSION DEPENDENCY
# ==============================================================================
def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session for a single request.

    Usage in a route:
        from fastapi import Depends
        from app.database import get_db

        @router.get("/items")
        def list_items(db: Session = Depends(get_db)):
            return db.query(Item).all()

    The 'yield' makes this a context manager:
      - Code before yield  → runs before the route handler (opens session)
      - yield db           → hands the session to the route handler
      - Code after yield   → runs after the response is sent (closes session)

    The finally block guarantees the session is always closed — even if an
    exception is raised inside the route handler.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """
    Utility that performs a lightweight SELECT 1 to verify database reachability.
    Used by the /api/health/db endpoint.
    Returns True on success, raises on failure.
    """
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return True
