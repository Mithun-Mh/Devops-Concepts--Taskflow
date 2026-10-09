// =============================================================================
// types/task.ts — Frontend Task Types
// =============================================================================
// These types mirror the FastAPI backend schemas (app/schemas/task.py).
// Status values must match the backend enum exactly:
//   Backend: pending | in_progress | completed
//   Frontend (display): "To Do" | "In Progress" | "Completed"
//
// The UI filter "ALL" is a frontend-only concept — it is never sent to the API.
// =============================================================================

/**
 * Valid task status values. Must exactly match the Python TaskStatus enum:
 *   TaskStatus.pending     = "pending"
 *   TaskStatus.in_progress = "in_progress"
 *   TaskStatus.completed   = "completed"
 */
export type TaskStatus = "pending" | "in_progress" | "completed";

/**
 * A task as returned by the FastAPI backend.
 * Matches the TaskResponse Pydantic schema.
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string; // ISO 8601 UTC timestamp
  updated_at: string;
}

/**
 * Valid filter values for the UI.
 * "ALL" is frontend-only; the rest map 1:1 to backend status values.
 */
export type TaskFilter = "ALL" | TaskStatus;

/**
 * Aggregated statistics shown in the stats cards.
 */
export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
}

/**
 * Display labels for each status value.
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

/**
 * Display labels for the filter tabs.
 */
export const FILTER_LABELS: Record<TaskFilter, string> = {
  ALL: "All Tasks",
  pending: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};
