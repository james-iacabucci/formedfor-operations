import { useState, useEffect } from "react";
import { TaskWithAssignee, UpdateTaskInput, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { useTaskMutations } from "@/hooks/tasks/useTaskMutations";
import { useTaskRelatedEntity } from "@/hooks/tasks/useTaskRelatedEntity";

export function useTaskUpdate(
  task: TaskWithAssignee,
  open: boolean,
  onOpenChange: (open: boolean) => void
) {
  const { toast } = useToast();
  const { updateTask, deleteTask } = useTaskMutations();
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [taskRelatedType, setTaskRelatedType] = useState<TaskRelatedType | string | null>(task.related_type || "general");
  const [assignedTo, setAssignedTo] = useState<string | null>(task.assigned_to);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const {
    entityId: sculptureEntityId,
    categoryName,
    categories,
    sculptures,
    sculpturesLoading,
    clients,
    clientsLoading,
    leads,
    leadsLoading,
    orders,
    ordersLoading,
    handleEntitySelection,
    handleCategoryChange,
    addCategory
  } = useTaskRelatedEntity(
    open, 
    taskRelatedType as TaskRelatedType, 
    task.sculpture_id,
    task.category_name
  );

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
    console.log("Related type changed to:", type);
    setTaskRelatedType(type || "general");
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
      
      if (!taskRelatedType || taskRelatedType === "general") {
        finalRelatedType = null;
      } else if (["sculpture", "client", "lead", "order"].includes(taskRelatedType as string)) {
        finalRelatedType = taskRelatedType as TaskRelatedType;
      }
      
      console.log("Related type before update:", taskRelatedType);
      console.log("Final related_type value to be sent:", finalRelatedType);
      console.log("Category name:", categoryName);
      
      const taskData: UpdateTaskInput = {
        id: task.id,
        title,
        description: description || "",
        assigned_to: assignedTo,
        status: status,
        related_type: finalRelatedType,
        sculpture_id: finalRelatedType === "sculpture" ? sculptureEntityId : null,
        client_id: finalRelatedType === "client" ? (task.client_id || null) : null,
        order_id: finalRelatedType === "order" ? (task.order_id || null) : null,
        lead_id: finalRelatedType === "lead" ? (task.lead_id || null) : null,
        category_name: finalRelatedType === null && categoryName && categoryName.trim() !== "" ? categoryName : null
      };
      
      console.log("Full task update data:", taskData);
      
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

  return {
    title,
    description,
    taskRelatedType,
    assignedTo,
    status,
    deleteDialogOpen,
    categoryName,
    categories,
    setTitle,
    setDescription,
    setTaskRelatedType,
    setAssignedTo,
    setStatus,
    setDeleteDialogOpen,
    handleRelatedTypeChange,
    handleAssigneeChange,
    handleStatusChange,
    handleCategoryChange,
    addCategory,
    handleUpdateTask,
    handleDeleteTask,
    updateTask,
    deleteTask,
    sculptureEntityId,
    sculptures,
    sculpturesLoading,
    clients,
    clientsLoading,
    leads,
    leadsLoading,
    orders,
    ordersLoading,
    handleEntitySelection,
  };
}
