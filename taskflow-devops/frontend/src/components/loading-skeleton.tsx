import React from "react";
import { Card } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((index) => (
        <Card
          key={index}
          className="border border-slate-200/80 p-5 dark:border-slate-800 animate-pulse bg-white/70 dark:bg-slate-900/70"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2.5 w-3/4">
              <div className="h-5 w-2/5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60" />
              <div className="flex items-center gap-2 pt-2">
                <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-28 rounded bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
