import React from "react";
import { Filter, RotateCw, AlertCircle } from "lucide-react";
import { TaskFilter } from "@/types/task";
import { Button } from "@/components/ui/button";

interface TaskFiltersProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: { all: number; todo: number; in_progress: number; done: number };
  isLoading: boolean;
  onSimulateLoading: () => void;
  isError: boolean;
  onToggleSimulateError: () => void;
}

export function TaskFilters({
  currentFilter,
  onFilterChange,
  counts,
  isLoading,
  onSimulateLoading,
  isError,
  onToggleSimulateError,
}: TaskFiltersProps) {
  const filterOptions: { label: string; value: TaskFilter; count: number }[] = [
    { label: "All Tasks", value: "ALL", count: counts.all },
    { label: "To Do", value: "TODO", count: counts.todo },
    { label: "In Progress", value: "IN_PROGRESS", count: counts.in_progress },
    { label: "Completed", value: "DONE", count: counts.done },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center gap-1 mr-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </div>
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              currentFilter === opt.value
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                currentFilter === opt.value
                  ? "bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {opt.count}
            </span>
          </button>
        ))}
      </div>

      {/* Simulator buttons for Loading & Error States */}
      <div className="flex items-center gap-2 self-end md:self-auto text-xs">
        <span className="text-slate-400 text-[11px] hidden lg:inline">Simulators:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onSimulateLoading}
          disabled={isLoading}
          className="h-8 text-xs gap-1 text-slate-600 dark:text-slate-300"
          title="Simulate API fetch delay"
        >
          <RotateCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          <span>Simulate Load</span>
        </Button>

        <Button
          variant={isError ? "destructive" : "outline"}
          size="sm"
          onClick={onToggleSimulateError}
          className="h-8 text-xs gap-1"
          title="Toggle network error state"
        >
          <AlertCircle className="h-3 w-3" />
          <span>{isError ? "Clear Error" : "Simulate Error"}</span>
        </Button>
      </div>
    </div>
  );
}
