# ==============================================================================
# tests/test_health.py — Health & Probes API Tests
# ==============================================================================
# Verifies Kubernetes liveness and readiness probe endpoints:
#   1. GET /api/health    -> Service health probe
#   2. GET /api/health/db -> Database connectivity probe
# ==============================================================================

from unittest.mock import patch
from fastapi.testclient import TestClient


def test_service_health_check_returns_200(client: TestClient):
    """
    Test that GET /api/health returns HTTP 200 OK and expected JSON schema:
    status='healthy', timestamp, environment, and version.
    """
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "environment" in data
    assert "version" in data


def test_database_health_check_healthy(client: TestClient):
    """
    Test that GET /api/health/db returns HTTP 200 OK when the database is reachable.
    """
    with patch("app.routes.health.check_db_connection", return_value=True):
        response = client.get("/api/health/db")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "connected"
        assert data["database"] == "postgresql"
        assert "timestamp" in data


def test_database_health_check_unreachable_returns_503(client: TestClient):
    """
    Test that GET /api/health/db returns HTTP 503 Service Unavailable
    when the database probe fails.
    """
    with patch("app.routes.health.check_db_connection", side_effect=Exception("Connection refused")):
        response = client.get("/api/health/db")
        assert response.status_code == 503
        data = response.json()
        assert "Database unreachable" in data["detail"]


def test_root_redirects_to_docs(client: TestClient):
    """
    Test that GET / redirects to Swagger UI documentation at /docs.
    """
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/docs"
