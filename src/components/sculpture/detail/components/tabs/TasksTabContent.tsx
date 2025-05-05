
import { TaskList } from "@/components/tasks/TaskList";

interface TasksTabContentProps {
  sculptureId: string;
}

export function TasksTabContent({ sculptureId }: TasksTabContentProps) {
  return (
    <TaskList sculptureId={sculptureId} />
  );
}
