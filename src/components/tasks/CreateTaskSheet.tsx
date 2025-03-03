
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

interface CreateTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId?: string | null;
  clientId?: string | null;
  orderId?: string | null;
  leadId?: string | null;
  relatedType?: TaskRelatedType;
  initialDescription?: string;
}

export function CreateTaskSheet({ 
  open, 
  onOpenChange, 
  sculptureId = null,
  clientId = null,
  orderId = null,
  leadId = null,
  relatedType = null,
  initialDescription = ""
}: CreateTaskSheetProps) {
  const { toast } = useToast();
  const { createTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  const { user: currentUser } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(initialDescription);
  const [taskRelatedType, setTaskRelatedType] = useState<TaskRelatedType | string | null>(relatedType || "general");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus>("todo");
  
  const {
    entityId: sculptureEntityId,
    sculptures,
    sculpturesLoading,
    handleEntitySelection
  } = useTaskRelatedEntity(open, taskRelatedType as TaskRelatedType, sculptureId);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription(initialDescription);
      setTaskRelatedType(relatedType || "general");
      setAssignedTo(currentUser?.id || null);
      setStatus("todo");
    }
  }, [open, relatedType, currentUser, initialDescription]);

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
    setTaskRelatedType(type || "general");
  };

  const handleAssigneeChange = (value: string) => {
    setAssignedTo(value === "unassigned" ? null : value);
  };
  
  const handleStatusChange = (value: TaskStatus) => {
    setStatus(value);
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
      
      if (taskRelatedType && typeof taskRelatedType === 'string') {
        if (taskRelatedType === 'general') {
          finalRelatedType = null;
        } else if (taskRelatedType === 'sculpture' || taskRelatedType === 'client' || 
                  taskRelatedType === 'lead' || taskRelatedType === 'order') {
          finalRelatedType = taskRelatedType as TaskRelatedType;
        }
      }
      
      const taskData: CreateTaskInput = {
        title,
        description: description || "",
        assigned_to: assignedTo,
        status: status,
        related_type: finalRelatedType,
        ...(finalRelatedType === "sculpture" && { sculpture_id: sculptureEntityId }),
        ...(finalRelatedType === "client" && { client_id: clientId }),
        ...(finalRelatedType === "order" && { order_id: orderId }),
        ...(finalRelatedType === "lead" && { lead_id: leadId })
      };
      
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Task</SheetTitle>
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
          <div></div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask} 
              disabled={createTask.isPending}
            >
              {createTask.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
