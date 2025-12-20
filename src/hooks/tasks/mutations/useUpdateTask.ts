
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
      
      // Migrate "soon" status to "todo" if needed
      let adjustedStatus = taskData.status;
      if (adjustedStatus === "soon" as any) {
        adjustedStatus = "todo" as TaskStatus;
      }
      
      // Prepare update data - explicitly handling related_type
      const updateData = {
        ...(taskData.title !== undefined && { title: taskData.title }),
        ...(taskData.description !== undefined && { description: taskData.description }),
        ...(taskData.assigned_to !== undefined && { assigned_to: taskData.assigned_to }),
        ...(adjustedStatus !== undefined && { status: adjustedStatus }),
        ...(taskData.priority_order !== undefined && { priority_order: taskData.priority_order }),
        ...(taskData.sculpture_id !== undefined && { sculpture_id: taskData.sculpture_id }),
        ...(taskData.client_id !== undefined && { client_id: taskData.client_id }),
        ...(taskData.order_id !== undefined && { order_id: taskData.order_id }),
        ...(taskData.lead_id !== undefined && { lead_id: taskData.lead_id }),
        ...(taskData.product_line_id !== undefined && { product_line_id: taskData.product_line_id }),
        ...(taskData.category_name !== undefined && { category_name: taskData.category_name }),
        // Convert TaskAttachment[] to Json for Supabase
        ...(taskData.attachments !== undefined && { attachments: taskData.attachments as any }),
        // We need to explicitly set related_type even if it's null
        related_type: taskData.related_type,
        updated_at: new Date().toISOString(),
      };
      
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
      
      // Handle status migration in the returned data
      let status = data.status;
      if (status === "soon" || status === "tomorrow" || status === "this_week") {
        status = "todo";
      }
      
      // Transform to the correct return type with explicit mapping
      const updatedTask: TaskWithAssignee = {
        id: data.id,
        sculpture_id: data.sculpture_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        status: status as TaskStatus,
        priority_order: data.priority_order,
        created_at: data.created_at,
        created_by: data.created_by,
        updated_at: data.updated_at,
        client_id: data.client_id || null,
        order_id: data.order_id || null,
        lead_id: data.lead_id || null,
        product_line_id: data.product_line_id || null,
        category_name: data.category_name || null,
        // Cast attachments back to our expected type
        attachments: (data.attachments || []) as any,
        // Fix: Properly cast the related_type to TaskRelatedType or null
        related_type: data.related_type as TaskRelatedType || null,
        assignee: data.assignee as any,
        sculpture: data.sculpture as any
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
