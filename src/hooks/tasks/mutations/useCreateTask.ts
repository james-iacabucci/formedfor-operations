
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
      // Get relatedType and entityId based on which ID is provided
      let relatedType: TaskRelatedType = taskData.related_type || null;
      let entityId: string | null = null;
      
      // Determine which entity ID to use based on the related_type
      if (relatedType === 'sculpture' && taskData.sculpture_id) {
        entityId = taskData.sculpture_id;
      } else if (relatedType === 'client' && taskData.client_id) {
        entityId = taskData.client_id;
      } else if (relatedType === 'order' && taskData.order_id) {
        entityId = taskData.order_id;
      } else if (relatedType === 'lead' && taskData.lead_id) {
        entityId = taskData.lead_id;
      }

      // Calculate the next priority order
      const nextPriorityOrder = await calculateNextPriorityOrder(
        relatedType,
        entityId
      );
      
      // Get the current user ID for created_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User is not authenticated");
      
      // Prepare the task data
      const newTask = {
        title: taskData.title,
        description: taskData.description || null,
        assigned_to: taskData.assigned_to || null,
        status: taskData.status || "todo" as TaskStatus,
        priority_order: nextPriorityOrder,
        created_by: user.id,
        related_type: relatedType,
        category_name: taskData.category_name || null,
        attachments: taskData.attachments || null,
        
        // Explicitly set all entity IDs (some will be null)
        sculpture_id: taskData.sculpture_id || null,
        client_id: taskData.client_id || null,
        order_id: taskData.order_id || null,
        lead_id: taskData.lead_id || null,
        product_line_id: taskData.product_line_id || null,
      };
      
      console.log("Creating task with data:", newTask);
      
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
        console.error("Error creating task:", error);
        throw error;
      }
      
      if (!data) throw new Error("Failed to retrieve created task");
      
      // Transform to the correct return type with explicit mapping to avoid type errors
      const createdTask: TaskWithAssignee = {
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
        client_id: data.client_id || null,
        order_id: data.order_id || null,
        lead_id: data.lead_id || null,
        product_line_id: data.product_line_id || null,
        category_name: data.category_name || null,
        related_type: data.related_type as TaskRelatedType || null,
        attachments: data.attachments || null,
        assignee: data.assignee
      };
      
      return createdTask;
    },
    onSuccess: (task) => {
      // Only invalidate sculpture-specific queries if the task has a sculpture_id
      if (task.sculpture_id) {
        queryClient.invalidateQueries({ queryKey: ["tasks", task.sculpture_id] });
      }
      // Always invalidate the general tasks query
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      console.error("Task creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}
