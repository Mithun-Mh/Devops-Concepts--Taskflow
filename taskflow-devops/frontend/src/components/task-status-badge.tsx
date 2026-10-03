import React from "react";
import { Circle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types/task";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  switch (status) {
    case "TODO":
      return (
        <Badge variant="todo" className="gap-1 font-mono">
          <Circle className="h-3 w-3 stroke-[2.5]" />
          To Do
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="in_progress" className="gap-1 font-mono">
          <Clock className="h-3 w-3 animate-pulse stroke-[2.5]" />
          In Progress
        </Badge>
      );
    case "DONE":
      return (
        <Badge variant="done" className="gap-1 font-mono">
          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
          Done
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
