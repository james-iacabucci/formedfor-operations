
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/tasks/queries/useUsers";
import { useTaskMutations } from "@/hooks/tasks/useTaskMutations";
import { CreateTaskInput, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useTaskRelatedEntity } from "@/hooks/tasks/useTaskRelatedEntity";
import { RelatedEntitySection } from "./form-sections/RelatedEntitySection";
import { TaskDetailsSection } from "./form-sections/TaskDetailsSection";
import { TaskAssignmentSection } from "./form-sections/TaskAssignmentSection";
import { useAuth } from "@/components/AuthProvider";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId?: string | null;
  clientId?: string | null;
  orderId?: string | null;
  leadId?: string | null;
  relatedType?: TaskRelatedType;
}

export function CreateTaskDialog({ 
  open, 
  onOpenChange, 
  sculptureId = null,
  clientId = null,
  orderId = null,
  leadId = null,
  relatedType = null
}: CreateTaskDialogProps) {
  const { toast } = useToast();
  const { createTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  const { user: currentUser } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskRelatedType, setTaskRelatedType] = useState<TaskRelatedType>(relatedType);
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  
  const {
    entityId: sculptureEntityId,
    sculptures,
    sculpturesLoading,
    handleEntitySelection
  } = useTaskRelatedEntity(open, taskRelatedType, sculptureId);

  // Initialize form values when the dialog opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setTaskRelatedType(relatedType);
      setStatus("todo");
      // Default to current user when the dialog opens
      setAssignedTo(currentUser?.id || null);
    }
  }, [open, relatedType, currentUser]);

  const handleRelatedTypeChange = (type: string) => {
    const newType = type === "none" ? null : type as TaskRelatedType;
    setTaskRelatedType(newType);
  };

  const handleAssigneeChange = (value: string) => {
    setAssignedTo(value === "unassigned" ? null : value);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData: CreateTaskInput = {
        title,
        description: description || "",
        assigned_to: assignedTo,
        status,
        related_type: taskRelatedType,
      };
      
      // Set the appropriate entity ID based on the related type
      if (taskRelatedType === "sculpture") {
        taskData.sculpture_id = sculptureEntityId;
      } else if (taskRelatedType === "client") {
        taskData.client_id = clientId;
      } else if (taskRelatedType === "order") {
        taskData.order_id = orderId;
      } else if (taskRelatedType === "lead") {
        taskData.lead_id = leadId;
      }
      
      console.log("Task data before submit:", taskData);
      await createTask.mutateAsync(taskData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <TaskDetailsSection
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
          />
          
          <RelatedEntitySection
            relatedType={taskRelatedType}
            entityId={sculptureEntityId}
            onEntitySelection={handleEntitySelection}
            onRelatedTypeChange={handleRelatedTypeChange}
            sculptures={sculptures}
            sculpturesLoading={sculpturesLoading}
          />
          
          <TaskAssignmentSection
            assignedTo={assignedTo}
            status={status}
            users={users}
            onAssigneeChange={handleAssigneeChange}
            onStatusChange={setStatus}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleCreateTask} 
            disabled={createTask.isPending}
          >
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
