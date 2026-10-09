// =============================================================================
// lib/api/tasks.ts — Task API Service
// =============================================================================
// This is the ONLY file that knows about task-specific API endpoints.
// Components never call apiClient directly — they import from this service.
//
// Endpoint map (mirrors the FastAPI backend):
//   GET    /tasks/           → fetchTasks(filter?)
//   POST   /tasks/           → createTask(data)
//   GET    /tasks/{id}       → fetchTaskById(id)
//   PUT    /tasks/{id}       → updateTask(id, data)
//   PATCH  /tasks/{id}/complete → completeTask(id)
//   DELETE /tasks/{id}       → deleteTask(id)
// =============================================================================

import { apiClient } from "./client";

// ---------------------------------------------------------------------------
// Types — mirror the FastAPI Pydantic schemas exactly
// Backend status values: "pending" | "in_progress" | "completed"
// ---------------------------------------------------------------------------

export type BackendTaskStatus = "pending" | "in_progress" | "completed";

export interface ApiTask {
  id: number;
  title: string;
  description: string | null;
  status: BackendTaskStatus;
  created_at: string; // ISO 8601 UTC string
  updated_at: string;
}

export interface ApiTaskListResponse {
  tasks: ApiTask[];
  count: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: BackendTaskStatus;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: BackendTaskStatus;
}

// ---------------------------------------------------------------------------
// Service functions — one function per API endpoint
// ---------------------------------------------------------------------------

/**
 * GET /tasks/
 * Fetch all tasks, optionally filtered by status.
 * Pass `status` to get only pending, in_progress, or completed tasks.
 */
export async function fetchTasks(
  status?: BackendTaskStatus
): Promise<ApiTaskListResponse> {
  const query = status ? `?status=${status}` : "";
  return apiClient.get<ApiTaskListResponse>(`/tasks/${query}`);
}

/**
 * GET /tasks/{id}
 * Fetch a single task by its ID.
 */
export async function fetchTaskById(id: number): Promise<ApiTask> {
  return apiClient.get<ApiTask>(`/tasks/${id}`);
}

/**
 * POST /tasks/
 * Create a new task. Returns the created task with its server-assigned id
 * and timestamps.
 */
export async function createTask(payload: CreateTaskPayload): Promise<ApiTask> {
  return apiClient.post<ApiTask>("/tasks/", payload);
}

/**
 * PUT /tasks/{id}
 * Update one or more fields on an existing task.
 * Only send the fields you want to change — omitted fields are unchanged.
 */
export async function updateTask(
  id: number,
  payload: UpdateTaskPayload
): Promise<ApiTask> {
  return apiClient.put<ApiTask>(`/tasks/${id}`, payload);
}

/**
 * PATCH /tasks/{id}/complete
 * Convenience endpoint — marks a task as "completed" in one call.
 * Equivalent to updateTask(id, { status: "completed" }) but more semantic.
 */
export async function completeTask(id: number): Promise<ApiTask> {
  return apiClient.patch<ApiTask>(`/tasks/${id}/complete`);
}

/**
 * DELETE /tasks/{id}
 * Permanently delete a task. Returns nothing on success (204 No Content).
 */
export async function deleteTask(id: number): Promise<void> {
  return apiClient.delete(`/tasks/${id}`);
}
