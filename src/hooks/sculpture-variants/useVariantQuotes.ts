
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FabricationQuote } from "@/types/fabrication-quote";
import { SculptureVariantDetails } from "@/components/sculpture/detail/SculptureVariant";

export function useVariantQuotes(sculptureId: string, variants?: SculptureVariantDetails[]) {
  const queryClient = useQueryClient();

  // Get quotes for a specific variant
  const getQuotesForVariant = async (variantId: string): Promise<FabricationQuote[]> => {
    console.log("Getting quotes for variant:", variantId);
    
    try {
      // First try to get quotes with the specific variant_id
      const { data: variantQuotes, error: variantQuotesError } = await supabase
        .from("fabrication_quotes")
        .select("*")
        .eq("variant_id", variantId)
        .order("quote_date", { ascending: false });

      if (variantQuotesError) throw variantQuotesError;

      if (variantQuotes && variantQuotes.length > 0) {
        console.log("Found quotes by variant_id:", variantQuotes.length);
        console.log("Loaded quotes:", variantQuotes.length);
        return variantQuotes as FabricationQuote[];
      }

      // If no quotes found with variant_id, return empty array
      console.log("No quotes found for variant:", variantId);
      return [];
    } catch (error) {
      console.error("Error fetching quotes for variant:", error);
      throw error;
    }
  };

  return {
    getQuotesForVariant
  };
}
