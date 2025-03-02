
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskRelatedType } from "@/types/task";

export interface EntityOption {
  id: string;
  name: string;
}

export function useTaskRelatedEntity(
  open: boolean,
  relatedType: TaskRelatedType | null,
  initialEntityId?: string | null
) {
  const [entityId, setEntityId] = useState<string | null>(initialEntityId || null);
  
  // Fetch available sculptures for the dropdown
  const { data: sculptures = [], isLoading: sculpturesLoading } = useQuery({
    queryKey: ["sculptures-minimal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sculptures")
        .select("id, ai_generated_name")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching sculptures:", error);
        throw error;
      }
      
      return (data || []).map(s => ({
        id: s.id,
        name: s.ai_generated_name || "Unnamed Sculpture"
      })) as EntityOption[];
    },
    enabled: open && relatedType === "sculpture",
  });

  // Reset entity ID when related type changes
  useEffect(() => {
    setEntityId(initialEntityId || null);
  }, [initialEntityId, relatedType]);

  const handleEntitySelection = (id: string) => {
    if (id === "none") {
      setEntityId(null);
    } else {
      setEntityId(id);
    }
  };

  return {
    entityId,
    setEntityId,
    sculptures,
    sculpturesLoading,
    handleEntitySelection
  };
}
