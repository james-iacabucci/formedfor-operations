
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
        return {
          ...item,
          status: item.status as TaskStatus,
          related_type: item.related_type as TaskRelatedType,
          client_id: item.client_id || null,
          order_id: item.order_id || null,
          lead_id: item.lead_id || null,
          assignee: item.assignee || null
        };
      });

      return typedData;
    },
  });
}

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
      const typedData: TaskWithAssignee[] = data.map(item => {
        return {
          ...item,
          status: item.status as TaskStatus,
          related_type: item.related_type as TaskRelatedType,
          client_id: item.client_id || null,
          order_id: item.order_id || null,
          lead_id: item.lead_id || null,
          assignee: item.assignee || null,
          sculpture: item.sculpture || null
        };
      });

      return typedData;
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");

      if (error) throw error;
      return data || [];
    },
  });
}
