
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Task, 
  CreateTaskInput,
  TaskStatus,
  TaskRelatedType
} from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { validateTaskEntityRelationships } from "../utils/taskValidation";
import { calculateNextPriorityOrder } from "../utils/priorityCalculation";

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateTaskInput): Promise<Task> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Validate task relationships
      validateTaskEntityRelationships(input);
      
      // Calculate the next priority order
      const relatedType = input.related_type || null;
      const entityId = input.sculpture_id || input.client_id || input.order_id || input.lead_id || null;
      const newPriorityOrder = await calculateNextPriorityOrder(relatedType, entityId);

      const taskData = {
        sculpture_id: input.sculpture_id || null,
        client_id: input.client_id || null,
        order_id: input.order_id || null,
        lead_id: input.lead_id || null,
        related_type: input.related_type || null,
        title: input.title,
        description: input.description || null,
        assigned_to: input.assigned_to || null,
        status: input.status || "todo",
        priority_order: newPriorityOrder,
        created_by: user.user.id,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create task",
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
        description: "Task created successfully",
      });
    },
  });
}
