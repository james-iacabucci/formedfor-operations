
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/tasks/queries/useUsers";
import { useTaskMutations } from "@/hooks/tasks/useTaskMutations";
import { TaskWithAssignee, UpdateTaskInput, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useTaskRelatedEntity } from "@/hooks/tasks/useTaskRelatedEntity";
import { RelatedEntitySection } from "./form-sections/RelatedEntitySection";
import { TaskDetailsSection } from "./form-sections/TaskDetailsSection";
import { TaskAssignmentSection } from "./form-sections/TaskAssignmentSection";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface UpdateTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithAssignee;
}

export function UpdateTaskSheet({ 
  open, 
  onOpenChange, 
  task 
}: UpdateTaskSheetProps) {
  const { toast } = useToast();
  const { updateTask, deleteTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [taskRelatedType, setTaskRelatedType] = useState<TaskRelatedType | string | null>(task.related_type || "general");
  const [assignedTo, setAssignedTo] = useState<string | null>(task.assigned_to);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const {
    entityId: sculptureEntityId,
    sculptures,
    sculpturesLoading,
    handleEntitySelection
  } = useTaskRelatedEntity(open, taskRelatedType as TaskRelatedType, task.sculpture_id);

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description || "");
      setTaskRelatedType(task.related_type || "general");
      setAssignedTo(task.assigned_to);
      setStatus(task.status);
    }
  }, [open, task]);

  // Add keyboard event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const handleRelatedTypeChange = (type: string) => {
    setTaskRelatedType(type);
  };

  const handleAssigneeChange = (value: string) => {
    setAssignedTo(value === "unassigned" ? null : value);
  };
  
  const handleStatusChange = (value: TaskStatus) => {
    setStatus(value);
  };

  const handleUpdateTask = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      let finalRelatedType: TaskRelatedType | null = null;
      
      if (taskRelatedType && typeof taskRelatedType === 'string') {
        if (taskRelatedType === 'general') {
          finalRelatedType = null;
        } else if (taskRelatedType === 'sculpture' || taskRelatedType === 'client' || 
                  taskRelatedType === 'lead' || taskRelatedType === 'order') {
          finalRelatedType = taskRelatedType as TaskRelatedType;
        }
      }
      
      const taskData: UpdateTaskInput = {
        id: task.id,
        title,
        description: description || "",
        assigned_to: assignedTo,
        status: status,
        related_type: finalRelatedType,
        // Only add entity IDs when the related type matches
        sculpture_id: finalRelatedType === "sculpture" ? sculptureEntityId : null,
        client_id: finalRelatedType === "client" ? task.client_id : null,
        order_id: finalRelatedType === "order" ? task.order_id : null,
        lead_id: finalRelatedType === "lead" ? task.lead_id : null,
      };
      
      await updateTask.mutateAsync(taskData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask.mutate(task.id);
      onOpenChange(false);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Task</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4 py-4">
            <TaskDetailsSection
              title={title}
              description={description}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
            />
            
            <TaskAssignmentSection
              assignedTo={assignedTo}
              status={status}
              users={users}
              onAssigneeChange={handleAssigneeChange}
              onStatusChange={handleStatusChange}
            />
            
            <RelatedEntitySection
              relatedType={taskRelatedType as TaskRelatedType}
              entityId={sculptureEntityId}
              onEntitySelection={handleEntitySelection}
              onRelatedTypeChange={handleRelatedTypeChange}
              sculptures={sculptures}
              sculpturesLoading={sculpturesLoading}
            />
          </div>
          
          <div className="flex items-center justify-between absolute bottom-6 right-6 left-6">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Delete
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateTask} 
                disabled={updateTask.isPending}
              >
                {updateTask.isPending ? "Updating..." : "Apply"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
