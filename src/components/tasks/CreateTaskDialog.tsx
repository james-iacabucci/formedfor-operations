
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
  const [taskRelatedType, setTaskRelatedType] = useState<TaskRelatedType | string | null>(relatedType);
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  
  const {
    entityId: sculptureEntityId,
    sculptures,
    sculpturesLoading,
    handleEntitySelection
  } = useTaskRelatedEntity(open, taskRelatedType as TaskRelatedType, sculptureId);

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
    if (type === "none") {
      setTaskRelatedType(null);
    } else {
      setTaskRelatedType(type);
    }
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
      let finalRelatedType: TaskRelatedType | null = null;
      let productLineId: string | null = null;
      
      // Parse the related type and determine if it's a product line
      if (taskRelatedType && typeof taskRelatedType === 'string') {
        if (taskRelatedType.startsWith('product_line_')) {
          finalRelatedType = 'product_line';
          productLineId = taskRelatedType.replace('product_line_', '');
        } else if (taskRelatedType === 'sculpture' || taskRelatedType === 'client' || 
                   taskRelatedType === 'lead' || taskRelatedType === 'order') {
          finalRelatedType = taskRelatedType as TaskRelatedType;
        }
      }
      
      const taskData: CreateTaskInput = {
        title,
        description: description || "",
        assigned_to: assignedTo,
        status,
        related_type: finalRelatedType,
      };
      
      // Set the appropriate entity ID based on the related type
      if (finalRelatedType === "sculpture") {
        taskData.sculpture_id = sculptureEntityId;
      } else if (finalRelatedType === "client") {
        taskData.client_id = clientId;
      } else if (finalRelatedType === "order") {
        taskData.order_id = orderId;
      } else if (finalRelatedType === "lead") {
        taskData.lead_id = leadId;
      } else if (finalRelatedType === "product_line" && productLineId) {
        taskData.product_line_id = productLineId;
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
            relatedType={taskRelatedType as TaskRelatedType}
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
