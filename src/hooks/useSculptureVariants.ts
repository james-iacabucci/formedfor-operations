
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureVariantDetails } from "@/components/sculpture/detail/SculptureVariant";
import { useToast } from "@/hooks/use-toast";

export function useSculptureVariants(sculptureId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch variants
  const { data: variants, isLoading } = useQuery({
    queryKey: ["sculpture-variants", sculptureId],
    queryFn: async () => {
      // For now, we'll simulate variants by using the existing quotes
      // Once you set up the database table, you can replace this with actual queries
      const { data: quotes, error } = await supabase
        .from("fabrication_quotes")
        .select("*")
        .eq("sculpture_id", sculptureId)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      // Generate unique variants based on physical attributes
      // This is temporary until we have a variants table
      const uniqueVariantsMap = new Map();
      quotes.forEach(quote => {
        // Create a key based on physical attributes
        const variantKey = [
          quote.material_id,
          quote.method_id,
          quote.height_in,
          quote.width_in,
          quote.depth_in,
          quote.base_material_id,
          quote.base_method_id,
          quote.base_height_in,
          quote.base_width_in,
          quote.base_depth_in
        ].join('-');

        // Only add if we don't have this variant yet
        if (!uniqueVariantsMap.has(variantKey)) {
          uniqueVariantsMap.set(variantKey, {
            id: quote.id, // Using quote ID as a temporary variant ID
            sculptureId: sculptureId,
            materialId: quote.material_id,
            methodId: quote.method_id,
            heightIn: quote.height_in,
            widthIn: quote.width_in,
            depthIn: quote.depth_in,
            weightKg: quote.weight_kg,
            weightLbs: quote.weight_lbs,
            baseMaterialId: quote.base_material_id,
            baseMethodId: quote.base_method_id,
            baseHeightIn: quote.base_height_in,
            baseWidthIn: quote.base_width_in,
            baseDepthIn: quote.base_depth_in,
            baseWeightKg: quote.base_weight_kg,
            baseWeightLbs: quote.base_weight_lbs,
            orderIndex: 0 // To be replaced with actual order
          });
        }
      });

      // Convert map to array
      const uniqueVariants = Array.from(uniqueVariantsMap.values());
      
      // If no variants, create a default one from sculpture details
      if (uniqueVariants.length === 0) {
        const { data: sculpture, error: sculptureError } = await supabase
          .from("sculptures")
          .select("*")
          .eq("id", sculptureId)
          .single();

        if (sculptureError) {
          throw sculptureError;
        }

        uniqueVariants.push({
          id: `default-${sculptureId}`,
          sculptureId: sculptureId,
          materialId: sculpture.material_id,
          methodId: sculpture.method_id,
          heightIn: sculpture.height_in,
          widthIn: sculpture.width_in,
          depthIn: sculpture.depth_in,
          weightKg: sculpture.weight_kg,
          weightLbs: sculpture.weight_lbs,
          baseMaterialId: sculpture.base_material_id,
          baseMethodId: sculpture.base_method_id,
          baseHeightIn: sculpture.base_height_in,
          baseWidthIn: sculpture.base_width_in,
          baseDepthIn: sculpture.base_depth_in,
          baseWeightKg: sculpture.base_weight_kg,
          baseWeightLbs: sculpture.base_weight_lbs,
          orderIndex: 0
        });
      }

      // Add order index
      uniqueVariants.forEach((variant, index) => {
        variant.orderIndex = index;
      });

      return uniqueVariants as SculptureVariantDetails[];
    },
  });

  // Function to get quotes for a specific variant
  const getQuotesForVariant = async (variantId: string) => {
    // In our current setup, all quotes with the same physical attributes are for the same variant
    // We need to find the quote that's being used as the variantId (temporary approach)
    const variant = variants?.find(v => v.id === variantId);
    
    if (!variant) {
      return [];
    }

    const { data: quotes, error } = await supabase
      .from("fabrication_quotes")
      .select("*")
      .eq("sculpture_id", sculptureId)
      .filter('material_id', 'eq', variant.materialId)
      .filter('method_id', 'eq', variant.methodId)
      .filter('height_in', 'eq', variant.heightIn)
      .filter('width_in', 'eq', variant.widthIn)
      .filter('depth_in', 'eq', variant.depthIn)
      .filter('base_material_id', 'eq', variant.baseMaterialId)
      .filter('base_method_id', 'eq', variant.baseMethodId)
      .filter('base_height_in', 'eq', variant.baseHeightIn)
      .filter('base_width_in', 'eq', variant.baseWidthIn)
      .filter('base_depth_in', 'eq', variant.baseDepthIn);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load quotes for this variant: " + error.message,
        variant: "destructive",
      });
      return [];
    }

    return quotes;
  };

  return {
    variants,
    isLoading,
    getQuotesForVariant
  };
}
