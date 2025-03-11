
import { supabase } from "@/integrations/supabase/client";
import { FabricationQuote } from "@/types/fabrication-quote";
import { SculptureVariantDetails } from "@/components/sculpture/detail/SculptureVariant";
import { useToast } from "@/hooks/use-toast";

export function useVariantQuotes(sculptureId: string, variants?: SculptureVariantDetails[]) {
  const { toast } = useToast();

  const getQuotesForVariant = async (variantId: string) => {
    try {
      console.log("Getting quotes for variant:", variantId);
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
        console.log("Found quotes by variant_id:", quotesWithVariantId.length);
        return quotesWithVariantId as FabricationQuote[];
      }

      // Fallback to the old way if no quotes found by variant_id
      const variant = variants?.find(v => v.id === variantId);
      if (!variant) {
        console.log("Variant not found for quotes lookup:", variantId);
        return [] as FabricationQuote[];
      }

      console.log("Falling back to attribute-based quote lookup for variant:", variant);
      
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
        console.error("Error in attribute-based quote lookup:", error);
        toast({
          title: "Error",
          description: "Failed to load quotes for this variant: " + error.message,
          variant: "destructive",
        });
        return [] as FabricationQuote[];
      }

      console.log("Found quotes via attribute-based lookup:", quotes?.length || 0);
      
      // Update these quotes to have the variant_id for future lookups
      if (quotes && quotes.length > 0) {
        console.log("Updating quotes with variant_id:", variantId);
        const { error: updateError } = await supabase
          .from("fabrication_quotes")
          .update({ variant_id: variantId })
          .in("id", quotes.map(q => q.id));
          
        if (updateError) {
          console.error("Error updating quotes with variant_id:", updateError);
        }
      }

      return quotes as FabricationQuote[];
    } catch (error) {
      console.error("Error in getQuotesForVariant:", error);
      return [] as FabricationQuote[];
    }
  };

  return { getQuotesForVariant };
}
