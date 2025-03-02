
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, User, Edit, Trash2, CheckCircle, Circle } from "lucide-react";
import { TaskWithAssignee, TaskStatus } from "@/types/task";
import { UpdateTaskDialog } from "./UpdateTaskDialog";
import { useAuth } from "@/components/AuthProvider";
import { useTaskMutations } from "@/hooks/tasks";

interface TaskItemProps {
  task: TaskWithAssignee;
  isDragging?: boolean;
}

const statusColors: Record<TaskStatus, string> = {
  todo: "blue",
  in_progress: "yellow",
  done: "green",
};

export function TaskItem({ task, isDragging }: TaskItemProps) {
  const { user } = useAuth();
  const { deleteTask } = useTaskMutations();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const statusColor = statusColors[task.status] || "gray";

  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${isDragging ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreVertical className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setUpdateDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this task?")) {
                    deleteTask.mutate(task.id);
                  }
                }}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {task.status === "done" ? (
              <CheckCircle className={`h-4 w-4 text-${statusColor}-500`} />
            ) : (
              <Circle className={`h-4 w-4 text-${statusColor}-500`} />
            )}
            {task.description || "No description"}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground py-0">
        {task.assignee && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee?.avatar_url || ""} alt={task.assignee?.username || ""} />
              <AvatarFallback>{task.assignee?.username?.substring(0, 2) || "??"}</AvatarFallback>
            </Avatar>
            <span>{task.assignee?.username || "Unassigned"}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground py-2">
        Updated {new Date(task.updated_at).toLocaleDateString()}
      </CardFooter>

      <UpdateTaskDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        task={task}
      />
    </Card>
  );
}
