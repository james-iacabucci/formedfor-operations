
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskWithAssignee } from "@/types/task";
import { TaskItem } from "./TaskItem";
import { useDroppable } from "@dnd-kit/core";

interface TaskColumnProps {
  id: string;
  title: string;
  count: number;
  tasks: TaskWithAssignee[];
  borderClass?: string;
  activeId: string | null;
}

export function TaskColumn({ id, title, count, tasks, borderClass = "border-t-primary", activeId }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <Card className={`h-full flex flex-col ${borderClass} border-t-4`}>
      <CardHeader className="p-2 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">
            {title}
            <span className="ml-2 bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
              {count}
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-2 flex-grow overflow-y-auto">
        <div
          ref={setNodeRef}
          className="h-full min-h-[100px] rounded-md"
        >
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isDragging={activeId === task.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
