
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/tasks/queries/useUsers";
import { useTaskMutations } from "@/hooks/tasks/useTaskMutations";
import { TaskWithAssignee, UpdateTaskInput, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useTaskRelatedEntity } from "@/hooks/tasks/useTaskRelatedEntity";
import { RelatedEntitySection } from "./form-sections/RelatedEntitySection";
import { TaskDetailsSection } from "./form-sections/TaskDetailsSection";
import { TaskAssignmentSection } from "./form-sections/TaskAssignmentSection";

interface UpdateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithAssignee;
}

export function UpdateTaskDialog({ 
  open, 
  onOpenChange, 
  task 
}: UpdateTaskDialogProps) {
  const { toast } = useToast();
  const { updateTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [taskRelatedType, setTaskRelatedType] = useState<TaskRelatedType | string | null>(task.related_type || "general");
  const [assignedTo, setAssignedTo] = useState<string | null>(task.assigned_to);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
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
        
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleUpdateTask} 
            disabled={updateTask.isPending}
          >
            {updateTask.isPending ? "Updating..." : "Update Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
