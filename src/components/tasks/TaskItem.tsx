
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskWithAssignee, UpdateTaskInput, TaskStatus } from "@/types/task";
import { useTaskMutations } from "@/hooks/useTasks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2Icon, GripIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useTasks";

interface TaskItemProps {
  task: TaskWithAssignee;
  isDragging?: boolean;
}

export function TaskItem({ task, isDragging = false }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { updateTask, deleteTask } = useTaskMutations();
  const { data: users = [] } = useUsers();

  const getStatusBadgeStyle = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "done":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusDisplayName = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const handleStatusChange = (value: string) => {
    const updateData: UpdateTaskInput = {
      id: task.id,
      status: value as TaskStatus,
    };
    updateTask.mutate(updateData);
  };

  const handleAssigneeChange = (userId: string) => {
    const updateData: UpdateTaskInput = {
      id: task.id,
      assigned_to: userId || null,
    };
    updateTask.mutate(updateData);
  };

  const handleDeleteTask = () => {
    deleteTask.mutate(task.id);
  };

  return (
    <Card 
      className={cn(
        "relative mb-2 transition-all duration-200 hover:shadow-md cursor-pointer",
        isDragging && "opacity-50 bg-accent",
        expanded && "shadow-md"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-1 cursor-grab">
        <GripIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <CardContent className="p-3 pl-7">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <Checkbox 
              checked={task.status === "done"}
              onCheckedChange={(checked) => {
                handleStatusChange(checked ? "done" : "todo");
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
            <div className="space-y-1 flex-1">
              <p className={cn(
                "font-medium",
                task.status === "done" && "line-through text-muted-foreground"
              )}>
                {task.title}
              </p>
              {expanded && task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar_url || ""} />
                <AvatarFallback>
                  {task.assignee.username?.substring(0, 2) || "??"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Badge variant="outline" className="text-xs">Unassigned</Badge>
            )}
            <Badge className={getStatusBadgeStyle(task.status)}>
              {getStatusDisplayName(task.status)}
            </Badge>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 flex flex-col space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Status:</span>
              <Select
                value={task.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Assignee:</span>
              <Select
                value={task.assigned_to || ""}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username || user.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2Icon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
