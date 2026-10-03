export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export type TaskFilter = "ALL" | TaskStatus;

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
}
