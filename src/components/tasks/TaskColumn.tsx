
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskWithAssignee } from "@/types/task";
import { TaskItem } from "./TaskItem";
import { ReactNode } from "react";

interface TaskColumnProps {
  title: ReactNode;
  tasks: TaskWithAssignee[];
  columnKey: string;
  columnStyleClass: string;
}

export function TaskColumn({ title, tasks, columnKey, columnStyleClass }: TaskColumnProps) {
  return (
    <Card key={columnKey} className={`border-t-4 ${columnStyleClass} h-full flex flex-col`}>
      <CardHeader className="pb-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">
            {title}
          </CardTitle>
          <Badge variant="outline">{tasks.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto flex-grow">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
