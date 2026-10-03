import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "todo" | "in_progress" | "done";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors border";

  const variants: Record<string, string> = {
    default:
      "border-transparent bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900",
    secondary:
      "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
    outline: "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
    todo:
      "border-amber-500/20 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
    in_progress:
      "border-blue-500/20 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
    done:
      "border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  };

  return <div className={cn(baseStyles, variants[variant], className)} {...props} />;
}
