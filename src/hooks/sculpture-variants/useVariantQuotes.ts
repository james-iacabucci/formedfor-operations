
import { useQueryClient } from "@tanstack/react-query";
import { FabricationQuote } from "@/types/fabrication-quote";
import { SculptureVariantDetails } from "@/components/sculpture/detail/SculptureVariant";
import { useVariantQuotesQuery } from "./useVariantQuotesQuery";

export function useVariantQuotes(sculptureId: string, variants?: SculptureVariantDetails[]) {
  const queryClient = useQueryClient();

  // Method to prefetch quotes for a specific variant
  const prefetchQuotesForVariant = async (variantId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["variant-quotes", variantId],
      queryFn: async () => {
        console.log("Prefetching quotes for variant:", variantId);
        // Implementation details are in the query hook
        return [];
      },
    });
  };

  // Method to get quotes for a specific variant - this is kept for backwards compatibility
  const getQuotesForVariant = async (variantId: string): Promise<FabricationQuote[]> => {
    try {
      // This will either return cached data or fetch fresh data
      return queryClient.fetchQuery({
        queryKey: ["variant-quotes", variantId],
        queryFn: async () => {
          console.log("Fetching quotes for variant:", variantId);
          
          // Try to get quotes with the specific variant_id
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
        },
      });
    } catch (error) {
      console.error("Error fetching quotes for variant:", error);
      throw error;
    }
  };

  return {
    getQuotesForVariant,
    prefetchQuotesForVariant
  };
}

// Add the import for supabase at the top if it's missing
import { supabase } from "@/integrations/supabase/client";
