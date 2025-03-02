
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
    // Use a fixed string for column name instead of template literal
    // This avoids the excessive type instantiation
    let column = "";
    
    // Manually determine the column name based on the relatedType
    if (relatedType === "sculpture") column = "sculpture_id";
    else if (relatedType === "client") column = "client_id";
    else if (relatedType === "order") column = "order_id";
    else if (relatedType === "lead") column = "lead_id";
    
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("priority_order")
      .eq(column, entityId)
      .order("priority_order", { ascending: false })
      .limit(1);
    
    if (existingTasks && existingTasks.length > 0) {
      return existingTasks[0].priority_order + 1;
    } else {
      return 0;
    }
  } else {
    // For unassociated tasks, get the highest priority among unassociated tasks
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("priority_order")
      .is("related_type", null)
      .order("priority_order", { ascending: false })
      .limit(1);
    
    if (existingTasks && existingTasks.length > 0) {
      return existingTasks[0].priority_order + 1;
    } else {
      return 0;
    }
  }
}
