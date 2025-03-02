
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

      // Ensure the status and related_type are correctly typed
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as TaskStatus,
        related_type: item.related_type as TaskRelatedType
      })) as TaskWithAssignee[];

      return typedData || [];
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

      // Ensure the status and related_type are correctly typed
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as TaskStatus,
        related_type: item.related_type as TaskRelatedType
      })) as TaskWithAssignee[];

      return typedData || [];
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
