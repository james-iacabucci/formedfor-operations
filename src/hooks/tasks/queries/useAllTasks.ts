
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskWithAssignee, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export function useAllTasks() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TaskWithAssignee[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:assigned_to(id, username, avatar_url),
          sculpture:sculpture_id(id, ai_generated_name, image_url)
        `)
        .order("priority_order", { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
        throw error;
      }

      // Check if data is undefined and return empty array if it is
      if (!data) return [];

      // Explicitly cast each task with the correct types
      const typedData: TaskWithAssignee[] = data.map(item => ({
        id: item.id,
        sculpture_id: item.sculpture_id,
        title: item.title,
        description: item.description,
        assigned_to: item.assigned_to,
        status: item.status as TaskStatus,
        priority_order: item.priority_order,
        created_at: item.created_at,
        created_by: item.created_by,
        updated_at: item.updated_at,
        // Add the fields our app expects but aren't in the database
        client_id: null,
        order_id: null,
        lead_id: null,
        related_type: "sculpture" as TaskRelatedType,
        assignee: item.assignee,
        sculpture: item.sculpture
      }));

      return typedData;
    },
  });
}
