
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTaskMutations } from "@/hooks/tasks/useTaskMutations";
import { useUsers } from "@/hooks/tasks/queries/useUsers";
import { TaskWithAssignee, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useTaskRelatedEntity } from "@/hooks/tasks/useTaskRelatedEntity";
import { TaskDetailsSection } from "./form-sections/TaskDetailsSection";
import { RelatedEntitySection } from "./form-sections/RelatedEntitySection";
import { TaskAssignmentSection } from "./form-sections/TaskAssignmentSection";

interface UpdateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithAssignee;
}

export function UpdateTaskDialog({ open, onOpenChange, task }: UpdateTaskDialogProps) {
  const { updateTask } = useTaskMutations();
  const { data: users = [] } = useUsers();
  const { toast } = useToast();
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "unassigned");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [relatedType, setRelatedType] = useState<TaskRelatedType | string | null>(
    task.related_type === 'product_line' && task.product_line_id 
      ? `product_line_${task.product_line_id}` 
      : task.related_type
  );
  
  const {
    entityId: sculptureEntityId,
    setEntityId: setSculptureEntityId,
    sculptures,
    sculpturesLoading,
    handleEntitySelection
  } = useTaskRelatedEntity(open, relatedType as TaskRelatedType, task.sculpture_id);
  
  // Client, order, and lead IDs
  const [clientId, setClientId] = useState<string | null>(task.client_id);
  const [orderId, setOrderId] = useState<string | null>(task.order_id);
  const [leadId, setLeadId] = useState<string | null>(task.lead_id);
  const [productLineId, setProductLineId] = useState<string | null>(task.product_line_id);
  
  // Reset form values when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setAssignedTo(task.assigned_to || "unassigned");
    setStatus(task.status);
    
    // Handle special case for product lines
    if (task.related_type === 'product_line' && task.product_line_id) {
      setRelatedType(`product_line_${task.product_line_id}`);
    } else {
      setRelatedType(task.related_type || null);
    }
    
    setSculptureEntityId(task.sculpture_id);
    setClientId(task.client_id);
    setOrderId(task.order_id);
    setLeadId(task.lead_id);
    setProductLineId(task.product_line_id);
  }, [task]);
  
  // Handle related type change
  const handleRelatedTypeChange = (type: string) => {
    if (type === "none") {
      setRelatedType(null);
    } else {
      setRelatedType(type);
    }
    
    // Reset all entity IDs
    setSculptureEntityId(null);
    setClientId(null);
    setOrderId(null);
    setLeadId(null);
    setProductLineId(null);
  };
  
  const handleAssigneeChange = (value: string) => {
    setAssignedTo(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let finalRelatedType: TaskRelatedType | null = null;
      let finalProductLineId: string | null = null;
      
      // Parse the related type and determine if it's a product line
      if (relatedType && typeof relatedType === 'string') {
        if (relatedType.startsWith('product_line_')) {
          finalRelatedType = 'product_line';
          finalProductLineId = relatedType.replace('product_line_', '');
        } else if (relatedType === 'sculpture' || relatedType === 'client' || 
                  relatedType === 'lead' || relatedType === 'order') {
          finalRelatedType = relatedType as TaskRelatedType;
        }
      }
      
      await updateTask.mutateAsync({
        id: task.id,
        title,
        description: description || null,
        assigned_to: assignedTo === "unassigned" ? null : assignedTo,
        status,
        related_type: finalRelatedType,
        sculpture_id: finalRelatedType === 'sculpture' ? sculptureEntityId : null,
        client_id: finalRelatedType === 'client' ? clientId : null,
        order_id: finalRelatedType === 'order' ? orderId : null,
        lead_id: finalRelatedType === 'lead' ? leadId : null,
        product_line_id: finalRelatedType === 'product_line' ? finalProductLineId : null
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
            onStatusChange={setStatus}
          />
          
          <RelatedEntitySection
            relatedType={relatedType as TaskRelatedType}
            entityId={sculptureEntityId}
            onEntitySelection={handleEntitySelection}
            onRelatedTypeChange={handleRelatedTypeChange}
            sculptures={sculptures}
            sculpturesLoading={sculpturesLoading}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending}>
              {updateTask.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
