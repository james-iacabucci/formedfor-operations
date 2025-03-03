
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Paintbrush,
  Users,
  ShoppingCart,
  FileText,
  Clock,
} from "lucide-react";
import { TaskWithAssignee } from "@/types/task";
import { UpdateTaskSheet } from "./UpdateTaskSheet";
import { useAuth } from "@/components/AuthProvider";
import { useTaskMutations } from "@/hooks/tasks";
import { getTaskAge } from "./utils/taskGrouping";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskItemProps {
  task: TaskWithAssignee;
  isDragging?: boolean;
}

const entityIcons = {
  sculpture: Paintbrush,
  client: Users,
  order: ShoppingCart,
  lead: FileText
};

export function TaskItem({ task, isDragging }: TaskItemProps) {
  const { user } = useAuth();
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      task
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  // Get the appropriate icon for the task's related type
  const EntityIcon = task.related_type ? entityIcons[task.related_type] : null;
  
  // Calculate task age in days
  const taskAge = getTaskAge(task.created_at);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="touch-manipulation mb-2"
    >
      <Card 
        className={`shadow-md hover:shadow-lg transition-shadow duration-200 ${isDragging || isSortableDragging ? 'opacity-50' : ''} border-t-4 ${getCardBorderColor(task.status)} cursor-pointer`}
        onClick={() => setUpdateSheetOpen(true)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Title */}
          <div className="font-medium text-sm break-words">{task.title}</div>
          
          {/* Related entity section - left aligned */}
          {task.related_type && EntityIcon && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <EntityIcon className="h-3 w-3" />
              <span className="capitalize truncate">{task.related_type}</span>
            </div>
          )}
          
          {/* Assignee and task age - left aligned */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {/* Assignee info */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {task.assignee ? (
                <>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignee?.avatar_url || ""} alt={task.assignee?.username || ""} />
                    <AvatarFallback className="text-[8px]">{task.assignee?.username?.substring(0, 2) || "??"}</AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[80px]">{task.assignee?.username}</span>
                </>
              ) : (
                <span className="italic">Unassigned</span>
              )}
            </div>
            
            {/* Task age */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
              <Clock className="h-3 w-3" />
              <span>{taskAge}d</span>
            </div>
          </div>
        </CardContent>

        <UpdateTaskSheet
          open={updateSheetOpen}
          onOpenChange={setUpdateSheetOpen}
          task={task}
        />
      </Card>
    </div>
  );
}

// Get border color based on task status
function getCardBorderColor(status: string): string {
  switch (status) {
    case "todo":
      return "border-slate-400";
    case "soon":
      return "border-blue-400";
    case "today":
      return "border-purple-500";
    case "in_progress":
      return "border-yellow-500";
    case "waiting":
      return "border-orange-500";
    case "done":
      return "border-green-500";
    default:
      return "border-gray-300";
  }
}
