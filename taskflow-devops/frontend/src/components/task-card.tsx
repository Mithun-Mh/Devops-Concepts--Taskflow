import React from "react";
import { Check, Trash2, Calendar, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { Task, TaskStatus } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (id: number, newStatus: TaskStatus) => void;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onUpdateStatus, onComplete, onDelete }: TaskCardProps) {
  // Cycle: pending → in_progress → completed → pending
  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === "pending") return "in_progress";
    if (current === "in_progress") return "completed";
    return "pending";
  };

  const nextStatusLabel = (current: TaskStatus): string => {
    if (current === "pending") return "Start Progress";
    if (current === "in_progress") return "Mark Done";
    return "Reopen Task";
  };

  const formattedDate = new Date(task.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="group relative border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-semibold text-slate-400">
              #{task.id}
            </span>
            <TaskStatusBadge status={task.status} />
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>

          <h4
            className={`text-base font-semibold tracking-tight text-slate-900 dark:text-white ${
              task.status === "completed"
                ? "line-through text-slate-400 dark:text-slate-500"
                : ""
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {task.description}
            </p>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end border-slate-100 dark:border-slate-800">
          {/* Cycle status button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(task.id, getNextStatus(task.status))}
            className="text-xs gap-1.5 h-8 px-2.5"
            title={`Move to ${getNextStatus(task.status)}`}
          >
            <span>{nextStatusLabel(task.status)}</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </Button>

          {/* Quick complete button (only shown if not already completed) */}
          {task.status !== "completed" && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onComplete(task.id)}
              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/50"
              title="Mark Completed"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            </Button>
          )}

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            title="Delete Task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
