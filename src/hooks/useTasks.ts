
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, CreateTaskInput, UpdateTaskInput, ReorderTasksInput, TaskWithAssignee, TaskStatus } from "@/types/task";
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

      // Ensure the status is correctly typed
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as TaskStatus
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

      // Ensure the status is correctly typed
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as TaskStatus
      })) as TaskWithAssignee[];

      return typedData || [];
    },
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput): Promise<Task> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the highest priority order for this sculpture
      const { data: existingTasks } = await supabase
        .from("tasks")
        .select("priority_order")
        .eq("sculpture_id", input.sculpture_id)
        .order("priority_order", { ascending: false })
        .limit(1);
      
      const newPriorityOrder = existingTasks && existingTasks.length > 0 
        ? (existingTasks[0].priority_order + 1) 
        : 0;

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          sculpture_id: input.sculpture_id,
          title: input.title,
          description: input.description || null,
          assigned_to: input.assigned_to || null,
          status: input.status || "todo",
          priority_order: newPriorityOrder,
          created_by: user.user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
        throw error;
      }

      // Ensure correct type
      return {
        ...data,
        status: data.status as TaskStatus
      } as Task;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.sculpture_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (input: UpdateTaskInput): Promise<Task> => {
      const updateData = {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.assigned_to !== undefined && { assigned_to: input.assigned_to }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.priority_order !== undefined && { priority_order: input.priority_order }),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        throw error;
      }

      // Ensure correct type
      return {
        ...data,
        status: data.status as TaskStatus
      } as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.sculpture_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
  });

  const deleteTask = useMutation({
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
  });

  const reorderTasks = useMutation({
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

  return {
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
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
