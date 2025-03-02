
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateTaskInput, TaskWithAssignee, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { calculateNextPriorityOrder } from "../utils/priorityCalculation";

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskData: CreateTaskInput): Promise<TaskWithAssignee> => {
      // Set the related_type based on which ID is provided
      let relatedType: TaskRelatedType = null;
      if (taskData.sculpture_id) relatedType = "sculpture";
      else if (taskData.client_id) relatedType = "client";
      else if (taskData.order_id) relatedType = "order";
      else if (taskData.lead_id) relatedType = "lead";

      // Calculate the next priority order
      const nextPriorityOrder = await calculateNextPriorityOrder(
        relatedType,
        taskData.sculpture_id || taskData.client_id || taskData.order_id || taskData.lead_id || null
      );
      
      // Get the current user ID for created_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User is not authenticated");
      
      // Prepare the task data
      const newTask = {
        sculpture_id: taskData.sculpture_id || null,
        client_id: taskData.client_id || null,
        order_id: taskData.order_id || null,
        lead_id: taskData.lead_id || null,
        related_type: relatedType,
        title: taskData.title,
        description: taskData.description || null,
        assigned_to: taskData.assigned_to || null,
        status: taskData.status || "todo" as TaskStatus,
        priority_order: nextPriorityOrder,
        created_by: user.id,
      };
      
      // Insert the task
      const { data, error } = await supabase
        .from("tasks")
        .insert(newTask)
        .select(`
          *,
          assignee:assigned_to(id, username, avatar_url)
        `)
        .single();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data) throw new Error("Failed to retrieve created task");
      
      // Transform to the correct return type with explicit mapping to avoid type errors
      const createdTask: TaskWithAssignee = {
        id: data.id,
        sculpture_id: data.sculpture_id,
        client_id: data.client_id || null,
        order_id: data.order_id || null,
        lead_id: data.lead_id || null,
        related_type: data.related_type as TaskRelatedType,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        status: data.status as TaskStatus,
        priority_order: data.priority_order,
        created_at: data.created_at,
        created_by: data.created_by,
        updated_at: data.updated_at,
        assignee: data.assignee
      };
      
      return createdTask;
    },
    onSuccess: (task) => {
      if (task.sculpture_id) {
        queryClient.invalidateQueries({ queryKey: ["tasks", task.sculpture_id] });
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
  });
}
