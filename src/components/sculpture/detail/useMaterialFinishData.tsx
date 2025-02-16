
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
        .order('code', { nullsFirst: false })
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const { data: finishes } = useQuery({
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

  return {
    materials,
    finishes,
  };
}
