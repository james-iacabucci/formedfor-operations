
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string): Promise<string | undefined> => {
      // Get the sculpture_id before deleting for cache invalidation
      const { data: taskData } = await supabase
        .from("tasks")
        .select("sculpture_id")
        .eq("id", taskId)
        .single();
      
      const sculptureId = taskData?.sculpture_id;

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
        throw error;
      }

      return sculptureId;
    },
    onSuccess: (sculptureId) => {
      if (sculptureId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", sculptureId] });
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  });
}
