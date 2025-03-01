import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sculpture, FileUpload } from "@/types/sculpture";
import { ViewSettings } from "@/hooks/use-user-preferences";

export function useSculpturesData(
  viewSettings: ViewSettings, 
  selectedProductLines: string[] = [],
  searchQuery: string = ""
) {
  // Query to fetch sculptures
  const { data: sculptures, isLoading } = useQuery({
    queryKey: ["sculptures", viewSettings, selectedProductLines, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("sculptures")
        .select("*");

      // Handle product line filtering
      if (selectedProductLines.length > 0) {
        query = query.in('product_line_id', selectedProductLines);
      }

      // Apply search filter if query exists
      if (searchQuery) {
        query = query.or(`ai_generated_name.ilike.%${searchQuery}%,manual_name.ilike.%${searchQuery}%`);
      }

      // Apply other filters
      if (viewSettings.materialIds.length > 0) {
        query = query.in('material_id', viewSettings.materialIds);
      }

      // Handle status filtering
      if (!viewSettings.selectedStatusIds.includes('all')) {
        query = query.in('status', viewSettings.selectedStatusIds);
      }

      if (viewSettings.heightOperator && viewSettings.heightValue !== null) {
        const heightField = viewSettings.heightUnit === 'in' ? 'height_in' : 'height_cm';
        switch (viewSettings.heightOperator) {
          case 'eq':
            query = query.eq(heightField, viewSettings.heightValue);
            break;
          case 'gt':
            query = query.gt(heightField, viewSettings.heightValue);
            break;
          case 'lt':
            query = query.lt(heightField, viewSettings.heightValue);
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
        status: item.status as "idea" | "pending" | "approved" | "archived",
        ai_engine: item.ai_engine as "runware" | "manual",
        creativity_level: item.creativity_level as "none" | "low" | "medium" | "high" | null,
        created_by: item.created_by,
        product_line_id: item.product_line_id 
      }));

      return transformedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query to fetch sculpture-tag relationships with longer cache time
  const { data: sculptureTagRelations } = useQuery({
    queryKey: ["sculpture_tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sculpture_tags")
        .select("sculpture_id, tag_id");

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Query to fetch all tags with longer cache time
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*");

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    sculptures,
    isLoading,
    sculptureTagRelations,
    tags,
  };
}
