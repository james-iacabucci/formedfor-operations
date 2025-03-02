
import { supabase } from "@/integrations/supabase/client";
import { TaskRelatedType } from "@/types/task";

/**
 * Calculates the next priority order for a task
 */
export async function calculateNextPriorityOrder(
  relatedType: TaskRelatedType,
  entityId: string | null
): Promise<number> {
  if (relatedType && entityId) {
    const column = `${relatedType}_id`;
    
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("priority_order")
      .eq(column, entityId)
      .order("priority_order", { ascending: false })
      .limit(1);
    
    return existingTasks && existingTasks.length > 0 
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
    
    return existingTasks && existingTasks.length > 0 
      ? (existingTasks[0].priority_order + 1) 
      : 0;
  }
}
