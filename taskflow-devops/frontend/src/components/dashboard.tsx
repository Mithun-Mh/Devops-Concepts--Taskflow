"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/stats-cards";
import { TaskFilters } from "@/components/task-filters";
import { TaskCard } from "@/components/task-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { CreateTaskModal } from "@/components/create-task-modal";
import { Task, TaskFilter, TaskStatus, TaskStats } from "@/types/task";

// Initial sample DevOps backlog tasks
const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: "Containerize FastAPI Backend with Multi-Stage Dockerfile",
    description: "Write production Dockerfile with non-root user and minimal alpine/slim python runtime.",
    status: "DONE",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 2,
    title: "Implement GitHub Actions CI Pipeline with Trivy Security Scan",
    description: "Automate linting, unit tests, and vulnerability scanning on every pull request to main.",
    status: "IN_PROGRESS",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 3,
    title: "Configure Argo CD Declarative GitOps Application Sync",
    description: "Define application.yaml manifest pointing to taskflow Helm chart repo for automated sync.",
    status: "TODO",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 4,
    title: "Provision Local 3-Node kind Kubernetes Cluster via Terraform",
    description: "Write Terraform configuration for kind cluster with port-forwarding for ingress controllers.",
    status: "TODO",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<TaskFilter>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Compute Task Stats
  const stats: TaskStats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      in_progress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    };
  }, [tasks]);

  // Filter tasks based on selected tab
  const filteredTasks = useMemo(() => {
    if (filter === "ALL") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  // Action handlers
  const handleCreateTask = (newTaskData: {
    title: string;
    description: string;
    status: TaskStatus;
  }) => {
    const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const newTask: Task = {
      id: nextId,
      title: newTaskData.title,
      description: newTaskData.description,
      status: newTaskData.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateStatus = (id: number, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // State simulators
  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  const handleToggleError = () => {
    setIsError(!isError);
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

        {/* Filters & Simulators */}
        <section className="space-y-4">
          <TaskFilters
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={{
              all: stats.total,
              todo: stats.todo,
              in_progress: stats.in_progress,
              done: stats.done,
            }}
            isLoading={isLoading}
            onSimulateLoading={handleSimulateLoading}
            isError={isError}
            onToggleSimulateError={handleToggleError}
          />

          {/* Conditional Rendering: Error vs Loading vs Content */}
          {isError ? (
            <ErrorState onRetry={() => setIsError(false)} />
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
