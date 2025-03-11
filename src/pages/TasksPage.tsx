
import { AppHeader } from "@/components/layout/AppHeader";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";

const TasksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-7xl py-6 px-6">
        <KanbanBoard />
      </div>
    </div>
  );
};

export default TasksPage;
