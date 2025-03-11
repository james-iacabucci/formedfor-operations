
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
      // Use the new sculpture_variants table
      const { data: variantsData, error } = await supabase
        .from("sculpture_variants")
        .select("*")
        .eq("sculpture_id", sculptureId)
        .eq("is_archived", false)
        .order("order_index", { ascending: true });

      if (error) {
        throw error;
      }

      // If no variants found, try to fetch from quotes as fallback (temporary)
      if (variantsData.length === 0) {
        // This fallback will be removed once all variants are migrated
        const { data: quotes, error: quotesError } = await supabase
          .from("fabrication_quotes")
          .select("*")
          .eq("sculpture_id", sculptureId)
          .order("created_at", { ascending: true });

        if (quotesError) {
          throw quotesError;
        }

        // Generate unique variants based on physical attributes
        const uniqueVariantsMap = new Map();
        quotes.forEach(quote => {
          // Create a key based on physical attributes
          const variantKey = [
            quote.material_id || 'null',
            quote.method_id || 'null',
            quote.height_in || 0,
            quote.width_in || 0,
            quote.depth_in || 0,
            quote.base_material_id || 'null',
            quote.base_method_id || 'null',
            quote.base_height_in || 0,
            quote.base_width_in || 0,
            quote.base_depth_in || 0
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
              orderIndex: 0, // To be replaced with actual order
              isArchived: false
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
            orderIndex: 0,
            isArchived: false
          });
        }

        // Add order index
        uniqueVariants.forEach((variant, index) => {
          variant.orderIndex = index;
        });

        return uniqueVariants as SculptureVariantDetails[];
      }

      // Map the database variants to our component structure
      return variantsData.map(variant => ({
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
        isArchived: variant.is_archived
      })) as SculptureVariantDetails[];
    },
  });

  // Create a new variant (duplicate of current)
  const createVariant = useMutation({
    mutationFn: async (currentVariantId: string) => {
      // Find the current variant
      const currentVariant = variants?.find(v => v.id === currentVariantId);
      if (!currentVariant) {
        throw new Error("Current variant not found");
      }

      // Get the max order index
      const maxOrderIndex = Math.max(...(variants?.map(v => v.orderIndex) || [0]));

      // Create a new variant based on the current one
      const { data, error } = await supabase
        .from("sculpture_variants")
        .insert({
          sculpture_id: sculptureId,
          material_id: currentVariant.materialId,
          method_id: currentVariant.methodId,
          height_in: currentVariant.heightIn,
          width_in: currentVariant.widthIn,
          depth_in: currentVariant.depthIn,
          weight_kg: currentVariant.weightKg,
          weight_lbs: currentVariant.weightLbs,
          base_material_id: currentVariant.baseMaterialId,
          base_method_id: currentVariant.baseMethodId,
          base_height_in: currentVariant.baseHeightIn,
          base_width_in: currentVariant.baseWidthIn,
          base_depth_in: currentVariant.baseDepthIn,
          base_weight_kg: currentVariant.baseWeightKg,
          base_weight_lbs: currentVariant.baseWeightLbs,
          order_index: maxOrderIndex + 1
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    },
    onSuccess: (newVariantId) => {
      queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
      toast({
        title: "Success",
        description: "New variant created successfully",
      });
      return newVariantId;
    },
    onError: (error) => {
      console.error("Error creating variant:", error);
      toast({
        title: "Error",
        description: "Failed to create new variant",
        variant: "destructive",
      });
    }
  });

  // Archive a variant
  const archiveVariant = useMutation({
    mutationFn: async (variantId: string) => {
      const { error } = await supabase
        .from("sculpture_variants")
        .update({ is_archived: true })
        .eq("id", variantId);

      if (error) {
        throw error;
      }

      return variantId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
      toast({
        title: "Success",
        description: "Variant archived successfully",
      });
    },
    onError: (error) => {
      console.error("Error archiving variant:", error);
      toast({
        title: "Error",
        description: "Failed to archive variant",
        variant: "destructive",
      });
    }
  });

  // Delete a variant completely
  const deleteVariant = useMutation({
    mutationFn: async (variantId: string) => {
      // First, delete any quotes associated with this variant
      const { error: quotesError } = await supabase
        .from("fabrication_quotes")
        .delete()
        .eq("variant_id", variantId);

      if (quotesError) {
        console.error("Error deleting associated quotes:", quotesError);
        // Continue anyway to try to delete the variant
      }

      // Then delete the variant
      const { error } = await supabase
        .from("sculpture_variants")
        .delete()
        .eq("id", variantId);

      if (error) {
        throw error;
      }

      return variantId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
      toast({
        title: "Success",
        description: "Variant deleted permanently",
      });
    },
    onError: (error) => {
      console.error("Error deleting variant:", error);
      toast({
        title: "Error",
        description: "Failed to delete variant",
        variant: "destructive",
      });
    }
  });

  // Function to get quotes for a specific variant
  const getQuotesForVariant = async (variantId: string) => {
    // First try to get quotes by variant_id
    const { data: quotesWithVariantId, error: variantIdError } = await supabase
      .from("fabrication_quotes")
      .select("*")
      .eq("variant_id", variantId);

    if (variantIdError) {
      console.error("Error fetching quotes by variant_id:", variantIdError);
    }

    // If we found quotes by variant_id, return them
    if (quotesWithVariantId && quotesWithVariantId.length > 0) {
      return quotesWithVariantId;
    }

    // Fallback to the old way if no quotes found by variant_id
    const variant = variants?.find(v => v.id === variantId);
    if (!variant) {
      return [];
    }

    // Build query filters based on variant attributes, handling null values properly
    let query = supabase
      .from("fabrication_quotes")
      .select("*")
      .eq("sculpture_id", sculptureId);
    
    // Add filters, handling null values carefully
    if (variant.materialId) {
      query = query.eq('material_id', variant.materialId);
    } else {
      query = query.is('material_id', null);
    }
    
    if (variant.methodId) {
      query = query.eq('method_id', variant.methodId);
    } else {
      query = query.is('method_id', null);
    }
    
    // Always filter on dimensions even if they're zero
    query = query.eq('height_in', variant.heightIn || 0);
    query = query.eq('width_in', variant.widthIn || 0);
    query = query.eq('depth_in', variant.depthIn || 0);
    
    // Handle base attributes null values properly
    if (variant.baseMaterialId) {
      query = query.eq('base_material_id', variant.baseMaterialId);
    } else {
      query = query.is('base_material_id', null);
    }
    
    if (variant.baseMethodId) {
      query = query.eq('base_method_id', variant.baseMethodId);
    } else {
      query = query.is('base_method_id', null);
    }
    
    // Base dimensions
    if (variant.baseHeightIn !== null && variant.baseHeightIn !== undefined) {
      query = query.eq('base_height_in', variant.baseHeightIn);
    } else {
      query = query.is('base_height_in', null);
    }
    
    if (variant.baseWidthIn !== null && variant.baseWidthIn !== undefined) {
      query = query.eq('base_width_in', variant.baseWidthIn);
    } else {
      query = query.is('base_width_in', null);
    }
    
    if (variant.baseDepthIn !== null && variant.baseDepthIn !== undefined) {
      query = query.eq('base_depth_in', variant.baseDepthIn);
    } else {
      query = query.is('base_depth_in', null);
    }

    const { data: quotes, error } = await query;

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
    getQuotesForVariant,
    createVariant: createVariant.mutateAsync,
    archiveVariant: archiveVariant.mutateAsync,
    deleteVariant: deleteVariant.mutateAsync,
    isCreatingVariant: createVariant.isPending,
    isArchivingVariant: archiveVariant.isPending,
    isDeletingVariant: deleteVariant.isPending
  };
}
