import React from "react";
import { CheckSquare, Activity, ShieldCheck, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <CheckSquare className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                TaskFlow
              </span>
              <span className="hidden sm:inline-block">
                <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                  DevOps Platform
                </Badge>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pipeline & Task Management
            </p>
          </div>
        </div>

        {/* Right Action & Status */}
        <div className="flex items-center gap-3">
          {/* Health Probe Indicator */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/60 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Activity className="h-3.5 w-3.5" />
              API: Standby (Mock)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <GitBranch className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Repository</span>
            </a>

            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Phase 2</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
