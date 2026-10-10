# ==============================================================================
# tests/conftest.py — Pytest Configuration & Test Fixtures
# ==============================================================================
# Pytest fixtures provide reusable, isolated dependencies for tests.
# This file configures:
#   1. An in-memory SQLite database for test isolation (fast, zero external dependency)
#   2. FastAPI dependency overrides to redirect route handlers from PostgreSQL to SQLite
#   3. A TestClient fixture for issuing HTTP requests against the FastAPI app
# ==============================================================================

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# ------------------------------------------------------------------------------
# Test Database Engine (In-Memory SQLite with StaticPool)
# ------------------------------------------------------------------------------
# StaticPool ensures that all connections share the same in-memory database,
# while check_same_thread=False allows FastAPI's background workers to share it.
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Session-level fixture: creates all tables before running any tests,
    and drops them once the full test suite finishes.
    """
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(autouse=True)
def clean_database():
    """
    Function-level fixture (runs automatically before each test):
    Cleans out all rows from every table to guarantee complete isolation.
    Tests never leak state or depend on the execution order of other tests.
    """
    with test_engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()
    yield
    with test_engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()


@pytest.fixture
def db_session():
    """
    Provides a standalone database session directly to tests
    that need to seed data or verify low-level database operations.
    """
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    """
    FastAPI TestClient fixture with dependency override.
    Overrides get_db so all HTTP requests routed through the FastAPI app
    use our isolated test database session instead of the production PostgreSQL pool.
    """
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
