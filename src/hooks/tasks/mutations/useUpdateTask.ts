
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UpdateTaskInput, TaskWithAssignee, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskData: UpdateTaskInput): Promise<TaskWithAssignee> => {
      // Get the current task data first (for invalidation)
      const { data: currentTask } = await supabase
        .from("tasks")
        .select("sculpture_id")
        .eq("id", taskData.id)
        .single();
      
      if (!currentTask) throw new Error("Task not found");
      
      // Prepare update data
      const updateData = {
        ...(taskData.title !== undefined && { title: taskData.title }),
        ...(taskData.description !== undefined && { description: taskData.description }),
        ...(taskData.assigned_to !== undefined && { assigned_to: taskData.assigned_to }),
        ...(taskData.status !== undefined && { status: taskData.status }),
        ...(taskData.priority_order !== undefined && { priority_order: taskData.priority_order }),
        ...(taskData.sculpture_id !== undefined && { sculpture_id: taskData.sculpture_id }),
        updated_at: new Date().toISOString(),
      };
      
      // Update the task
      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskData.id)
        .select(`
          *,
          assignee:assigned_to(id, username, avatar_url)
        `)
        .single();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data) throw new Error("Failed to retrieve updated task");
      
      // Transform to the correct return type with explicit mapping
      const updatedTask: TaskWithAssignee = {
        id: data.id,
        sculpture_id: data.sculpture_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        status: data.status as TaskStatus,
        priority_order: data.priority_order,
        created_at: data.created_at,
        created_by: data.created_by,
        updated_at: data.updated_at,
        // Add the additional fields we need for our app logic
        client_id: taskData.client_id || null,
        order_id: taskData.order_id || null,
        lead_id: taskData.lead_id || null,
        related_type: taskData.related_type || null,
        assignee: data.assignee
      };
      
      return updatedTask;
    },
    onSuccess: (task, variables) => {
      // Invalidate queries for both old and new sculpture_id if changed
      if (task.sculpture_id) {
        queryClient.invalidateQueries({ queryKey: ["tasks", task.sculpture_id] });
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
  });
}
