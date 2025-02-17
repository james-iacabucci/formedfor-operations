
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sculpture, FileUpload } from "@/types/sculpture";

interface ViewSettings {
  sortBy: 'created_at' | 'ai_generated_name' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  productLineId: string | null;
  materialIds: string[];
  status: string | null;
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
}

export function useSculpturesData(viewSettings: ViewSettings) {
  // Query to fetch sculptures
  const { data: sculptures, isLoading } = useQuery({
    queryKey: ["sculptures", viewSettings],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      let query = supabase
        .from("sculptures")
        .select("*")
        .eq("user_id", user.user.id);

      // Apply filters
      if (viewSettings.productLineId) {
        query = query.eq('product_line_id', viewSettings.productLineId);
      }

      if (viewSettings.status) {
        query = query.eq('status', viewSettings.status);
      }

      if (viewSettings.heightOperator && viewSettings.heightValue !== null) {
        switch (viewSettings.heightOperator) {
          case 'eq':
            query = query.eq('height_in', viewSettings.heightValue);
            break;
          case 'gt':
            query = query.gt('height_in', viewSettings.heightValue);
            break;
          case 'lt':
            query = query.lt('height_in', viewSettings.heightValue);
            break;
        }
      }

      // Apply sorting
      query = query.order(viewSettings.sortBy, { 
        ascending: viewSettings.sortOrder === 'asc' 
      });

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to match the Sculpture type
      const transformedData = data.map((item: any): Sculpture => ({
        ...item,
        models: Array.isArray(item.models) ? item.models as FileUpload[] : [],
        renderings: Array.isArray(item.renderings) ? item.renderings as FileUpload[] : [],
        dimensions: Array.isArray(item.dimensions) ? item.dimensions as FileUpload[] : [],
        status: item.status as "ideas" | "pending_additions" | "approved",
        ai_engine: item.ai_engine as "runware" | "manual",
        creativity_level: item.creativity_level as "none" | "small" | "medium" | "large" | null,
      }));

      return transformedData;
    },
  });

  // Query to fetch sculpture-tag relationships
  const { data: sculptureTagRelations } = useQuery({
    queryKey: ["sculpture_tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sculpture_tags")
        .select("sculpture_id, tag_id");

      if (error) throw error;
      return data;
    },
  });

  // Query to fetch all tags
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.user.id);

      if (error) throw error;
      return data;
    },
  });

  return {
    sculptures,
    isLoading,
    sculptureTagRelations,
    tags,
  };
}
