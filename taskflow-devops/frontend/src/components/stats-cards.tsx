import React from "react";
import { ListTodo, Clock, CheckCircle2, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TaskStats } from "@/types/task";

interface StatsCardsProps {
  stats: TaskStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Tasks",
      count: stats.total,
      description: "All pipeline work items",
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-200 dark:border-blue-900/50",
    },
    {
      title: "To Do",
      count: stats.todo,
      description: "Pending implementation",
      icon: ListTodo,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      title: "In Progress",
      count: stats.in_progress,
      description: "Currently being executed",
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
      borderColor: "border-indigo-200 dark:border-indigo-900/50",
    },
    {
      title: "Completed",
      count: stats.done,
      description: "Successfully shipped",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${card.borderColor}`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {card.count}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
