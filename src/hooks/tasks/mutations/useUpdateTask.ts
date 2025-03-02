
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Task, 
  UpdateTaskInput,
  TaskStatus,
  TaskRelatedType
} from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { validateTaskEntityRelationships } from "../utils/taskValidation";

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateTaskInput): Promise<Task> => {
      // Validate relationships if they're being updated
      validateTaskEntityRelationships(input);

      const updateData = {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.assigned_to !== undefined && { assigned_to: input.assigned_to }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.priority_order !== undefined && { priority_order: input.priority_order }),
        ...(input.sculpture_id !== undefined && { sculpture_id: input.sculpture_id }),
        ...(input.client_id !== undefined && { client_id: input.client_id }),
        ...(input.order_id !== undefined && { order_id: input.order_id }),
        ...(input.lead_id !== undefined && { lead_id: input.lead_id }),
        ...(input.related_type !== undefined && { related_type: input.related_type }),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        throw error;
      }

      // Construct and return the task with proper types
      const task: Task = {
        id: data.id,
        sculpture_id: data.sculpture_id,
        client_id: data.client_id,
        order_id: data.order_id,
        lead_id: data.lead_id,
        related_type: data.related_type as TaskRelatedType,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        status: data.status as TaskStatus,
        priority_order: data.priority_order,
        created_at: data.created_at,
        created_by: data.created_by,
        updated_at: data.updated_at
      };

      return task;
    },
    onSuccess: (data) => {
      // Invalidate queries based on the type of entity the task is related to
      if (data.sculpture_id) {
        queryClient.invalidateQueries({ queryKey: ["tasks", data.sculpture_id] });
      }
      
      // Always invalidate the general tasks query
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
  });
}
