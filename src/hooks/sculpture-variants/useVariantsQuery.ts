
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureVariantDetails } from "@/components/sculpture/detail/SculptureVariant";
import { FileUpload } from "@/types/sculpture";

export const useVariantsQuery = (sculptureId: string | undefined) => {
  return useQuery({
    queryKey: ["sculpture-variants", sculptureId],
    queryFn: async () => {
      if (!sculptureId) {
        return [];
      }

      const { data, error } = await supabase
        .from("sculpture_variants")
        .select("*")
        .eq("sculpture_id", sculptureId)
        .eq("is_archived", false)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching variants:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No variants found, creating default variant");
        // Create a default variant if none exists
        const { data: newVariant, error: createError } = await supabase
          .from("sculpture_variants")
          .insert({
            sculpture_id: sculptureId,
            order_index: 0,
            is_archived: false,
            // Initialize with empty arrays for the new fields
            renderings: [],
            dimensions: []
          })
          .select("*")
          .single();

        if (createError) {
          console.error("Error creating default variant:", createError);
          throw createError;
        }

        return [mapVariant(newVariant)];
      }

      return data.map(mapVariant);
    },
    enabled: !!sculptureId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1
  });
};

const mapVariant = (variant: any): SculptureVariantDetails => {
  return {
    id: variant.id,
    sculptureId: variant.sculpture_id,
    materialId: variant.material_id,
    methodId: variant.method_id,
    heightIn: variant.height_in,
    widthIn: variant.width_in,
    depthIn: variant.depth_in,
    weightKg: variant.weight_kg,
    weightLbs: variant.weight_lbs,
    baseMaterialId: variant.base_material_id,
    baseMethodId: variant.base_method_id,
    baseHeightIn: variant.base_height_in,
    baseWidthIn: variant.base_width_in,
    baseDepthIn: variant.base_depth_in,
    baseWeightKg: variant.base_weight_kg,
    baseWeightLbs: variant.base_weight_lbs,
    orderIndex: variant.order_index,
    isArchived: variant.is_archived || false,
    // Add the new fields
    image_url: variant.image_url || null,
    // Ensure renderings and dimensions are always arrays
    renderings: Array.isArray(variant.renderings) ? variant.renderings as FileUpload[] : [],
    dimensions: Array.isArray(variant.dimensions) ? variant.dimensions as FileUpload[] : []
  };
};
