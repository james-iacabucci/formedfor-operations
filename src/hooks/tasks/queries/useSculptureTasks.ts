
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskWithAssignee, TaskStatus, TaskRelatedType } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export function useSculptureTasks(sculptureId: string) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["tasks", sculptureId],
    queryFn: async (): Promise<TaskWithAssignee[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:assigned_to(id, username, avatar_url)
        `)
        .eq("sculpture_id", sculptureId)
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
      const typedData: TaskWithAssignee[] = data.map(item => {
        // Handle status migration
        let status = item.status;
        if (status === "soon" || status === "tomorrow" || status === "this_week") {
          status = "todo";
        }
        
        return {
          id: item.id,
          sculpture_id: item.sculpture_id,
          title: item.title,
          description: item.description,
          assigned_to: item.assigned_to,
          status: status as TaskStatus,
          priority_order: item.priority_order,
          created_at: item.created_at,
          created_by: item.created_by,
          updated_at: item.updated_at,
          client_id: item.client_id || null,
          order_id: item.order_id || null,
          lead_id: item.lead_id || null,
          product_line_id: item.product_line_id || null,
          category_name: item.category_name || null,
          related_type: item.related_type as TaskRelatedType || null,
          attachments: (item.attachments || []) as any,
          assignee: item.assignee
        };
      });

      return typedData;
    },
  });
}
