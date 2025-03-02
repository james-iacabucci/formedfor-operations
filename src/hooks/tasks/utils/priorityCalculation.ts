
import { supabase } from "@/integrations/supabase/client";
import { TaskRelatedType } from "@/types/task";

/**
 * Calculates the next priority order for a task
 */
export async function calculateNextPriorityOrder(
  relatedType: TaskRelatedType,
  entityId: string | null
): Promise<number> {
  try {
    // Call the PostgreSQL function to calculate the next priority order
    const { data, error } = await supabase.rpc('get_next_priority_order', {
      p_related_type: relatedType,
      p_entity_id: entityId
    });

    if (error) {
      console.error('Error calculating next priority order:', error);
      return 0; // Default to 0 if there's an error
    }

    return data || 0;
  } catch (err) {
    console.error('Error calculating next priority order:', err);
    return 0; // Default to 0 if there's an error
  }
}
