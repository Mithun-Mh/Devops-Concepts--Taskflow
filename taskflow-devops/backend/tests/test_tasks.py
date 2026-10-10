# ==============================================================================
# tests/test_tasks.py — CRUD & Edge Case API Tests for Tasks Resource
# ==============================================================================
# Tests all CRUD operations and validation boundaries for /api/tasks:
#   - Create task (valid full, valid minimal)
#   - Get tasks (all, filtered by status)
#   - Get task by ID
#   - Update task (partial update, complete task PATCH shortcut)
#   - Delete task (success & subsequent 404 verification)
#   - Invalid task (missing title, empty title, oversized title, invalid status)
#   - Non-existent task (404 for GET, PUT, DELETE, PATCH)
# ==============================================================================

from fastapi.testclient import TestClient


# ==============================================================================
# 1. CREATE TASK TESTS
# ==============================================================================

def test_create_task_with_all_fields(client: TestClient):
    """
    POST /api/tasks creates a task with title, description, and status.
    Returns HTTP 201 Created and auto-assigned ID and timestamps.
    """
    payload = {
        "title": "Configure Prometheus Alerts",
        "description": "Set up alertmanager rules for high CPU usage",
        "status": "in_progress",
    }
    response = client.post("/api/tasks", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["id"] > 0
    assert data["title"] == payload["title"]
    assert data["description"] == payload["description"]
    assert data["status"] == "in_progress"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_task_with_minimal_fields_uses_default_status(client: TestClient):
    """
    POST /api/tasks with only required 'title' succeeds with default status='pending'
    and null description.
    """
    payload = {"title": "Write Unit Tests"}
    response = client.post("/api/tasks", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Write Unit Tests"
    assert data["description"] is None
    assert data["status"] == "pending"


# ==============================================================================
# 2. GET TASKS (LIST & FILTER)
# ==============================================================================

def test_get_tasks_empty_list(client: TestClient):
    """
    GET /api/tasks returns an empty list and count=0 when no tasks exist.
    """
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert data["tasks"] == []
    assert data["count"] == 0


def test_get_tasks_returns_all_created_tasks(client: TestClient):
    """
    GET /api/tasks returns all tasks ordered newest first.
    """
    client.post("/api/tasks", json={"title": "Task 1"})
    client.post("/api/tasks", json={"title": "Task 2"})
    client.post("/api/tasks", json={"title": "Task 3"})

    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3
    assert len(data["tasks"]) == 3
    # Newest task first
    assert data["tasks"][0]["title"] == "Task 3"
    assert data["tasks"][1]["title"] == "Task 2"
    assert data["tasks"][2]["title"] == "Task 1"


def test_get_tasks_filter_by_status(client: TestClient):
    """
    GET /api/tasks?status=completed returns only tasks matching the status filter.
    """
    client.post("/api/tasks", json={"title": "Pending Task", "status": "pending"})
    client.post("/api/tasks", json={"title": "Completed Task 1", "status": "completed"})
    client.post("/api/tasks", json={"title": "Completed Task 2", "status": "completed"})

    # Filter for completed
    response = client.get("/api/tasks?status=completed")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    assert all(task["status"] == "completed" for task in data["tasks"])

    # Filter for pending
    response_pending = client.get("/api/tasks?status=pending")
    assert response_pending.status_code == 200
    data_pending = response_pending.json()
    assert data_pending["count"] == 1
    assert data_pending["tasks"][0]["title"] == "Pending Task"


# ==============================================================================
# 3. GET TASK BY ID
# ==============================================================================

def test_get_task_by_id_success(client: TestClient):
    """
    GET /api/tasks/{id} returns the task object matching the ID.
    """
    created_res = client.post("/api/tasks", json={"title": "Deploy Helm Chart", "description": "Chart v1.2"})
    task_id = created_res.json()["id"]

    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Deploy Helm Chart"
    assert data["description"] == "Chart v1.2"


# ==============================================================================
# 4. UPDATE TASK TESTS
# ==============================================================================

def test_update_task_fields(client: TestClient):
    """
    PUT /api/tasks/{id} updates title, description, and status.
    """
    created_res = client.post("/api/tasks", json={"title": "Initial Title", "description": "Initial Desc"})
    task_id = created_res.json()["id"]

    update_payload = {
        "title": "Updated Title",
        "description": "Updated Desc",
        "status": "in_progress",
    }
    response = client.put(f"/api/tasks/{task_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["description"] == "Updated Desc"
    assert data["status"] == "in_progress"


def test_update_task_partial_fields_leaves_others_intact(client: TestClient):
    """
    PUT /api/tasks/{id} with only one field updates only that field,
    leaving other fields unchanged.
    """
    created_res = client.post("/api/tasks", json={"title": "My Task", "description": "Original Description"})
    task_id = created_res.json()["id"]

    response = client.put(f"/api/tasks/{task_id}", json={"status": "completed"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["title"] == "My Task"
    assert data["description"] == "Original Description"


def test_complete_task_patch_shortcut(client: TestClient):
    """
    PATCH /api/tasks/{id}/complete transitions task status to 'completed'.
    """
    created_res = client.post("/api/tasks", json={"title": "Task to complete", "status": "pending"})
    task_id = created_res.json()["id"]

    response = client.patch(f"/api/tasks/{task_id}/complete")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"


# ==============================================================================
# 5. DELETE TASK TESTS
# ==============================================================================

def test_delete_task_success(client: TestClient):
    """
    DELETE /api/tasks/{id} returns HTTP 204 No Content.
    Subsequent GET returns HTTP 404 Not Found.
    """
    created_res = client.post("/api/tasks", json={"title": "Task to delete"})
    task_id = created_res.json()["id"]

    # Delete
    delete_res = client.delete(f"/api/tasks/{task_id}")
    assert delete_res.status_code == 204

    # Verify gone
    get_res = client.get(f"/api/tasks/{task_id}")
    assert get_res.status_code == 404


# ==============================================================================
# 6. INVALID TASK VALIDATION TESTS
# ==============================================================================

def test_create_task_missing_title_returns_422(client: TestClient):
    """
    POST /api/tasks with missing 'title' triggers Pydantic validation error (422).
    """
    response = client.post("/api/tasks", json={"description": "No title provided"})
    assert response.status_code == 422
    data = response.json()
    assert any("title" in loc for err in data["detail"] for loc in err["loc"])


def test_create_task_empty_title_returns_422(client: TestClient):
    """
    POST /api/tasks with empty string title violates min_length=1 (422).
    """
    response = client.post("/api/tasks", json={"title": ""})
    assert response.status_code == 422


def test_create_task_title_too_long_returns_422(client: TestClient):
    """
    POST /api/tasks with title > 100 characters violates max_length=100 (422).
    """
    long_title = "A" * 101
    response = client.post("/api/tasks", json={"title": long_title})
    assert response.status_code == 422


def test_create_task_invalid_status_returns_422(client: TestClient):
    """
    POST /api/tasks with invalid status enum value returns 422.
    """
    response = client.post("/api/tasks", json={"title": "Test", "status": "non_existent_status"})
    assert response.status_code == 422


def test_update_task_invalid_status_returns_422(client: TestClient):
    """
    PUT /api/tasks/{id} with invalid status enum value returns 422.
    """
    created_res = client.post("/api/tasks", json={"title": "Test Task"})
    task_id = created_res.json()["id"]

    response = client.put(f"/api/tasks/{task_id}", json={"status": "invalid_status"})
    assert response.status_code == 422


# ==============================================================================
# 7. NON-EXISTENT TASK TESTS (404 NOT FOUND)
# ==============================================================================

def test_get_nonexistent_task_returns_404(client: TestClient):
    """
    GET /api/tasks/{id} returns HTTP 404 when task ID does not exist.
    """
    response = client.get("/api/tasks/999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_nonexistent_task_returns_404(client: TestClient):
    """
    PUT /api/tasks/{id} returns HTTP 404 when task ID does not exist.
    """
    response = client.put("/api/tasks/999999", json={"title": "Updated Title"})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_complete_nonexistent_task_returns_404(client: TestClient):
    """
    PATCH /api/tasks/{id}/complete returns HTTP 404 when task ID does not exist.
    """
    response = client.patch("/api/tasks/999999/complete")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_nonexistent_task_returns_404(client: TestClient):
    """
    DELETE /api/tasks/{id} returns HTTP 404 when task ID does not exist.
    """
    response = client.delete("/api/tasks/999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
