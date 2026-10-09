"use client";

// =============================================================================
// components/dashboard.tsx — Main Dashboard with Live API Integration
// =============================================================================
// All state mutations call the API service layer (lib/api/tasks.ts).
// No fetch() calls, no URLs, and no hardcoded data live in this component.
// Data flow:
//   Mount → fetchTasks() → display tasks
//   Create → createTask() → append to state (optimistic UI)
//   Update → updateTask() → update in state
//   Complete → completeTask() → update in state
//   Delete → deleteTask() → remove from state
// =============================================================================

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/stats-cards";
import { TaskFilters } from "@/components/task-filters";
import { TaskCard } from "@/components/task-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { CreateTaskModal } from "@/components/create-task-modal";
import { Task, TaskFilter, TaskStatus, TaskStats } from "@/types/task";
import {
  fetchTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  ApiError,
} from "@/lib/api";

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // ---------------------------------------------------------------------------
  // Load tasks from the API on mount and on manual refresh
  // ---------------------------------------------------------------------------
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");

    try {
      const response = await fetchTasks();
      setTasks(response.tasks as Task[]);
    } catch (err) {
      setIsError(true);
      if (err instanceof ApiError) {
        setErrorMessage(`API Error ${err.status}: ${err.detail}`);
      } else {
        setErrorMessage(
          "Cannot reach the backend. Is FastAPI running on port 8000?"
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ---------------------------------------------------------------------------
  // Computed stats
  // ---------------------------------------------------------------------------
  const stats: TaskStats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  // ---------------------------------------------------------------------------
  // Filtered task list
  // ---------------------------------------------------------------------------
  const filteredTasks = useMemo(() => {
    if (filter === "ALL") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  // ---------------------------------------------------------------------------
  // CREATE — POST /api/tasks/
  // ---------------------------------------------------------------------------
  const handleCreateTask = async (newTaskData: {
    title: string;
    description: string;
    status: TaskStatus;
  }) => {
    try {
      const created = await createTask({
        title: newTaskData.title,
        description: newTaskData.description || null,
        status: newTaskData.status,
      });
      // Prepend to list so the newest task appears first (mirrors API ordering)
      setTasks((prev) => [created as Task, ...prev]);
    } catch (err) {
      console.error("Failed to create task:", err);
      // Re-fetch to keep UI in sync with server state
      await loadTasks();
    }
  };

  // ---------------------------------------------------------------------------
  // UPDATE STATUS — PUT /api/tasks/{id}
  // ---------------------------------------------------------------------------
  const handleUpdateStatus = async (id: number, newStatus: TaskStatus) => {
    // Optimistic update — apply immediately, roll back on error
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      )
    );

    try {
      const updated = await updateTask(id, { status: newStatus });
      // Replace optimistic entry with the server-confirmed version
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? (updated as Task) : task))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Roll back by re-fetching
      await loadTasks();
    }
  };

  // ---------------------------------------------------------------------------
  // COMPLETE — PATCH /api/tasks/{id}/complete
  // ---------------------------------------------------------------------------
  const handleCompleteTask = async (id: number) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: "completed", updated_at: new Date().toISOString() }
          : task
      )
    );

    try {
      const updated = await completeTask(id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? (updated as Task) : task))
      );
    } catch (err) {
      console.error("Failed to complete task:", err);
      await loadTasks();
    }
  };

  // ---------------------------------------------------------------------------
  // DELETE — DELETE /api/tasks/{id}
  // ---------------------------------------------------------------------------
  const handleDeleteTask = async (id: number) => {
    // Optimistic removal
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await deleteTask(id);
    } catch (err) {
      console.error("Failed to delete task:", err);
      // Roll back by re-fetching
      await loadTasks();
    }
  };

  return (
    <main className="flex-1 pb-16 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              DevOps Delivery Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track infrastructure tasks, pipeline milestones, and Kubernetes deployments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Manual refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={loadTasks}
              disabled={isLoading}
              className="gap-2 text-slate-600 dark:text-slate-300"
              title="Refresh tasks from API"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Task Statistics */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            Task Statistics
          </h2>
          <StatsCards stats={stats} />
        </section>

        {/* Filters & Task List */}
        <section className="space-y-4">
          <TaskFilters
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={{
              all: stats.total,
              pending: stats.pending,
              in_progress: stats.in_progress,
              completed: stats.completed,
            }}
            isLoading={isLoading}
            onRefresh={loadTasks}
          />

          {/* Error banner with detail message */}
          {errorMessage && isError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
              <strong>Connection error:</strong> {errorMessage}
            </div>
          )}

          {/* Conditional Rendering: Error vs Loading vs Content */}
          {isError ? (
            <ErrorState onRetry={loadTasks} />
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              onOpenCreateModal={() => setIsModalOpen(true)}
              filter={filter}
            />
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdateStatus={handleUpdateStatus}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal Dialog */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </main>
  );
}
