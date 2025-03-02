
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Task, 
  CreateTaskInput, 
  UpdateTaskInput, 
  ReorderTasksInput, 
  TaskStatus,
  TaskRelatedType
} from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput): Promise<Task> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Validate that only one related entity is set
      const entityCount = [
        input.sculpture_id, 
        input.client_id, 
        input.order_id, 
        input.lead_id
      ].filter(Boolean).length;
      
      if (entityCount > 1) {
        throw new Error("A task can only be related to one entity");
      }
      
      if (entityCount === 1 && !input.related_type) {
        throw new Error("Related type must be specified when a related entity is set");
      }
      
      // If a related entity is set, make sure it matches the related_type
      if (input.sculpture_id && input.related_type !== "sculpture") {
        throw new Error("Related type must be 'sculpture' when sculpture_id is provided");
      }
      
      if (input.client_id && input.related_type !== "client") {
        throw new Error("Related type must be 'client' when client_id is provided");
      }
      
      if (input.order_id && input.related_type !== "order") {
        throw new Error("Related type must be 'order' when order_id is provided");
      }
      
      if (input.lead_id && input.related_type !== "lead") {
        throw new Error("Related type must be 'lead' when lead_id is provided");
      }

      // Get the highest priority order for the related entity (if any)
      let newPriorityOrder = 0;
      
      if (input.related_type && 
          (input.sculpture_id || input.client_id || input.order_id || input.lead_id)) {
        const column = `${input.related_type}_id`;
        const value = input[`${input.related_type}_id` as keyof typeof input];
        
        const { data: existingTasks } = await supabase
          .from("tasks")
          .select("priority_order")
          .eq(column, value)
          .order("priority_order", { ascending: false })
          .limit(1);
        
        newPriorityOrder = existingTasks && existingTasks.length > 0 
          ? (existingTasks[0].priority_order + 1) 
          : 0;
      } else {
        // For unassociated tasks, get the highest priority among unassociated tasks
        const { data: existingTasks } = await supabase
          .from("tasks")
          .select("priority_order")
          .is("related_type", null)
          .order("priority_order", { ascending: false })
          .limit(1);
        
        newPriorityOrder = existingTasks && existingTasks.length > 0 
          ? (existingTasks[0].priority_order + 1) 
          : 0;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          sculpture_id: input.sculpture_id || null,
          client_id: input.client_id || null,
          order_id: input.order_id || null,
          lead_id: input.lead_id || null,
          related_type: input.related_type || null,
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
        status: data.status as TaskStatus,
        related_type: data.related_type as TaskRelatedType
      } as Task;
    },
    onSuccess: (data) => {
      // Invalidate queries based on the type of entity the task is related to
      if (data.sculpture_id) {
        queryClient.invalidateQueries({ queryKey: ["tasks", data.sculpture_id] });
      }
      
      // Always invalidate the general tasks query
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (input: UpdateTaskInput): Promise<Task> => {
      // Validate that only one related entity is being set (if any are being updated)
      if (
        (input.sculpture_id !== undefined ||
         input.client_id !== undefined ||
         input.order_id !== undefined ||
         input.lead_id !== undefined) &&
        (input.related_type !== undefined)
      ) {
        const entityCount = [
          input.sculpture_id, 
          input.client_id, 
          input.order_id, 
          input.lead_id
        ].filter(entity => entity !== undefined && entity !== null).length;
        
        if (entityCount > 1) {
          throw new Error("A task can only be related to one entity");
        }
        
        // If a related entity is set, make sure it matches the related_type
        if (input.sculpture_id && input.related_type !== "sculpture") {
          throw new Error("Related type must be 'sculpture' when sculpture_id is provided");
        }
        
        if (input.client_id && input.related_type !== "client") {
          throw new Error("Related type must be 'client' when client_id is provided");
        }
        
        if (input.order_id && input.related_type !== "order") {
          throw new Error("Related type must be 'order' when order_id is provided");
        }
        
        if (input.lead_id && input.related_type !== "lead") {
          throw new Error("Related type must be 'lead' when lead_id is provided");
        }
      }

      const updateData = {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.assigned_to !== undefined && { assigned_to: input.assigned_to }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.priority_order !== undefined && { priority_order: input.priority_order }),
        ...(input.sculpture_id !== undefined && { sculpture_id: input.sculpture_id }),
        ...(input.client_id !== undefined && { client_id: input.client_id }),
        ...(input.order_id !== undefined && { order_id: input.order_id }),
        ...(input.lead_id !== undefined && { lead_id: input.lead_id }),
        ...(input.related_type !== undefined && { related_type: input.related_type }),
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
        status: data.status as TaskStatus,
        related_type: data.related_type as TaskRelatedType
      } as Task;
    },
    onSuccess: (data) => {
      // Invalidate queries based on the type of entity the task is related to
      if (data.sculpture_id) {
        queryClient.invalidateQueries({ queryKey: ["tasks", data.sculpture_id] });
      }
      
      // Always invalidate the general tasks query
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
