import React from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onOpenCreateModal: () => void;
  filter: string;
}

export function EmptyState({ onOpenCreateModal, filter }: EmptyStateProps) {
  const isFiltered = filter !== "ALL";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        <ClipboardList className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
        {isFiltered ? "No matching tasks found" : "No tasks in the pipeline yet"}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {isFiltered
          ? `There are currently no tasks with status "${filter}". Try switching filter or create a new task.`
          : "Get started by adding your first DevOps backlog item or pipeline deployment task."}
      </p>
      <div className="mt-6">
        <Button onClick={onOpenCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Task
        </Button>
      </div>
    </div>
  );
}
