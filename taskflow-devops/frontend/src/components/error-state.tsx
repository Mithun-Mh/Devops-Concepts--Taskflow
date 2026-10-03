import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Failed to load tasks from pipeline service. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold">Service Disruption Detected</h4>
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{message}</p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-rose-300 bg-white text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
