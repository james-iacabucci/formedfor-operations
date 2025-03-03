
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
      
      // Log the incoming task data for debugging
      console.log("Raw taskData received for update:", taskData);
      
      // Prepare update data - explicitly handling related_type
      const updateData = {
        ...(taskData.title !== undefined && { title: taskData.title }),
        ...(taskData.description !== undefined && { description: taskData.description }),
        ...(taskData.assigned_to !== undefined && { assigned_to: taskData.assigned_to }),
        ...(taskData.status !== undefined && { status: taskData.status }),
        ...(taskData.priority_order !== undefined && { priority_order: taskData.priority_order }),
        ...(taskData.sculpture_id !== undefined && { sculpture_id: taskData.sculpture_id }),
        ...(taskData.client_id !== undefined && { client_id: taskData.client_id }),
        ...(taskData.order_id !== undefined && { order_id: taskData.order_id }),
        ...(taskData.lead_id !== undefined && { lead_id: taskData.lead_id }),
        ...(taskData.product_line_id !== undefined && { product_line_id: taskData.product_line_id }),
        ...(taskData.category_name !== undefined && { category_name: taskData.category_name }),
        ...(taskData.attachments !== undefined && { attachments: taskData.attachments }),
        // We need to explicitly set related_type even if it's null
        related_type: taskData.related_type,
        updated_at: new Date().toISOString(),
      };
      
      console.log("Sending update data to Supabase:", updateData);
      
      // Update the task
      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskData.id)
        .select(`
          *,
          assignee:assigned_to(id, username, avatar_url),
          sculpture:sculpture_id(id, ai_generated_name, image_url)
        `)
        .single();
      
      if (error) {
        console.error("Supabase update error:", error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data) throw new Error("Failed to retrieve updated task");
      
      console.log("Data returned from Supabase:", data);
      
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
        client_id: data.client_id || null,
        order_id: data.order_id || null,
        lead_id: data.lead_id || null,
        product_line_id: data.product_line_id || null,
        category_name: data.category_name || null,
        attachments: data.attachments || null,
        // Fix: Properly cast the related_type to TaskRelatedType or null
        related_type: data.related_type as TaskRelatedType || null,
        assignee: data.assignee,
        sculpture: data.sculpture
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
