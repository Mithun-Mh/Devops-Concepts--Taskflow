import React from "react";
import { Filter, RefreshCw } from "lucide-react";
import { TaskFilter } from "@/types/task";
import { Button } from "@/components/ui/button";

interface TaskFiltersProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: { all: number; pending: number; in_progress: number; completed: number };
  isLoading: boolean;
  onRefresh: () => void;
}

export function TaskFilters({
  currentFilter,
  onFilterChange,
  counts,
  isLoading,
  onRefresh,
}: TaskFiltersProps) {
  const filterOptions: { label: string; value: TaskFilter; count: number }[] = [
    { label: "All Tasks",    value: "ALL",         count: counts.all },
    { label: "To Do",        value: "pending",     count: counts.pending },
    { label: "In Progress",  value: "in_progress", count: counts.in_progress },
    { label: "Completed",    value: "completed",   count: counts.completed },
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

      {/* Refresh button — replaces old "simulate" buttons now that API is live */}
      <div className="flex items-center gap-2 self-end md:self-auto text-xs">
        <span className="text-slate-400 text-[11px] hidden lg:inline">Live API:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 text-xs gap-1 text-slate-600 dark:text-slate-300"
          title="Reload tasks from FastAPI backend"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          <span>Sync with API</span>
        </Button>
      </div>
    </div>
  );
}
