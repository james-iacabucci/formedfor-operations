
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureVariantDetails } from "@/components/sculpture/detail/SculptureVariant";
import { FileUpload } from "@/types/sculpture";

export function useVariantsQuery(sculptureId: string) {
  return useQuery({
    queryKey: ["sculpture-variants", sculptureId],
    queryFn: async () => {
      try {
        // Use the raw query approach to avoid TypeScript errors
        const { data: variantsData, error } = await supabase
          .from('sculpture_variants')
          .select('*')
          .eq('sculpture_id', sculptureId)
          .eq('is_archived', false)
          .order('order_index', { ascending: true });
          
        if (error) {
          console.error("Error fetching variants:", error);
          throw error;
        }

        console.log("Fetched variants:", variantsData);

        // If no variants found, try to fetch from quotes as fallback (temporary)
        if (!variantsData || variantsData.length === 0) {
          return await generateFallbackVariants(sculptureId);
        }

        // Map the database variants to our component structure
        const mappedVariants = variantsData.map(variant => ({
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
          isArchived: variant.is_archived,
          // New fields for variant-specific data
          image_url: variant.image_url || null,
          renderings: Array.isArray(variant.renderings) ? variant.renderings : [],
          dimensions: Array.isArray(variant.dimensions) ? variant.dimensions : []
        })) as SculptureVariantDetails[];
        
        console.log("Mapped variants:", mappedVariants);
        return mappedVariants;
      } catch (error) {
        console.error("Error fetching variants:", error);
        return [] as SculptureVariantDetails[];
      }
    },
  });
}

async function generateFallbackVariants(sculptureId: string): Promise<SculptureVariantDetails[]> {
  // This fallback will be removed once all variants are migrated
  const { data: quotes, error: quotesError } = await supabase
    .from("fabrication_quotes")
    .select("*")
    .eq("sculpture_id", sculptureId)
    .order("created_at", { ascending: true });

  if (quotesError) {
    console.error("Error fetching quotes:", quotesError);
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
        isArchived: false,
        // Using sculpture data for now
        image_url: null,
        renderings: [],
        dimensions: []
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
      console.error("Error fetching sculpture:", sculptureError);
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
      isArchived: false,
      // Using sculpture data for now
      image_url: sculpture.image_url,
      renderings: sculpture.renderings || [],
      dimensions: sculpture.dimensions || []
    });
  }

  // Add order index
  uniqueVariants.forEach((variant, index) => {
    variant.orderIndex = index;
  });

  console.log("Generated variants from fallback:", uniqueVariants);
  return uniqueVariants as SculptureVariantDetails[];
}
