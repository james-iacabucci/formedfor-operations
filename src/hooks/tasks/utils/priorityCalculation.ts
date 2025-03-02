
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
    // Define the column name using a simple string
    // This avoids TypeScript excessive type instantiation
    let columnName = "";
    
    // Manually determine the column name based on the relatedType
    if (relatedType === "sculpture") {
      columnName = "sculpture_id";
    } else if (relatedType === "client") {
      columnName = "client_id";
    } else if (relatedType === "order") {
      columnName = "order_id";
    } else if (relatedType === "lead") {
      columnName = "lead_id";
    }
    
    // Use explicit type casting to avoid type recursion
    const query = supabase
      .from("tasks")
      .select("priority_order")
      .eq(columnName as string, entityId)
      .order("priority_order", { ascending: false })
      .limit(1);
    
    const { data: existingTasks } = await query;
    
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
