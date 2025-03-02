
import { AppHeader } from "@/components/layout/AppHeader";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";

const TasksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="w-full py-6">
        <KanbanBoard />
      </div>
    </div>
  );
};

export default TasksPage;
