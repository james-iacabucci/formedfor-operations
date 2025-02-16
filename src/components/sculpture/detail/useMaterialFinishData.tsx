
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMaterialFinishData(materialId: string | null) {
  const { data: materials } = useQuery({
    queryKey: ["value_lists", "material"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "material")
        .order('code', { nullsFirst: false })  // Changed to nullsFirst: false
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const { data: allFinishes } = useQuery({
    queryKey: ["value_lists", "finish"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "finish")
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const { data: materialFinishes } = useQuery({
    queryKey: ["material-finishes", materialId],
    enabled: !!materialId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_finishes")
        .select("finish_id")
        .eq("material_id", materialId);

      if (error) throw error;
      return data;
    },
  });

  const validFinishIds = materialFinishes?.map(mf => mf.finish_id) || [];
  const finishes = allFinishes?.filter(finish => 
    !materialId || validFinishIds.includes(finish.id)
  );

  return {
    materials,
    finishes,
    allFinishes,
  };
}
