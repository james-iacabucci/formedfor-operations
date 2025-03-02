
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReorderTasksInput } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export function useReorderTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskId, newPriorityOrder }: ReorderTasksInput): Promise<string> => {
      // Get the task to find the sculpture_id
      const { data: taskData } = await supabase
        .from("tasks")
        .select("sculpture_id, priority_order")
        .eq("id", taskId)
        .single();
      
      if (!taskData) throw new Error("Task not found");
      
      const { sculpture_id, priority_order: oldPriorityOrder } = taskData;
      
      // Determine if we're moving up or down
      const isMovingDown = newPriorityOrder > oldPriorityOrder;
      
      // Update all affected tasks in between old and new positions
      if (isMovingDown) {
        // If moving down, decrement priority of tasks between old+1 and new
        await supabase.rpc('update_task_priorities', {
          p_sculpture_id: sculpture_id,
          p_start_order: oldPriorityOrder + 1,
          p_end_order: newPriorityOrder,
          p_adjustment: -1
        });
      } else {
        // If moving up, increment priority of tasks between new and old-1
        await supabase.rpc('update_task_priorities', {
          p_sculpture_id: sculpture_id,
          p_start_order: newPriorityOrder,
          p_end_order: oldPriorityOrder - 1,
          p_adjustment: 1
        });
      }
      
      // Update the task being dragged
      const { error } = await supabase
        .from("tasks")
        .update({ priority_order: newPriorityOrder, updated_at: new Date().toISOString() })
        .eq("id", taskId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to reorder tasks",
          variant: "destructive",
        });
        throw error;
      }

      return sculpture_id;
    },
    onSuccess: (sculptureId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", sculptureId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
