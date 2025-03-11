
import { useQuery } from "@tanstack/react-query";
import { FabricationQuote } from "@/types/fabrication-quote";
import { supabase } from "@/integrations/supabase/client";

export function useVariantQuotesQuery(variantId: string | null) {
  return useQuery({
    queryKey: ["variant-quotes", variantId],
    queryFn: async () => {
      if (!variantId) return [] as FabricationQuote[];
      
      console.log("Getting quotes for variant:", variantId);
      
      try {
        const { data: variantQuotes, error: variantQuotesError } = await supabase
          .from("fabrication_quotes")
          .select("*")
          .eq("variant_id", variantId)
          .order("quote_date", { ascending: false });

        if (variantQuotesError) throw variantQuotesError;

        if (variantQuotes && variantQuotes.length > 0) {
          console.log("Found quotes by variant_id:", variantQuotes.length);
          return variantQuotes as FabricationQuote[];
        }

        // If no quotes found with variant_id, return empty array
        console.log("No quotes found for variant:", variantId);
        return [] as FabricationQuote[];
      } catch (error) {
        console.error("Error fetching quotes for variant:", error);
        throw error;
      }
    },
    enabled: !!variantId,
    staleTime: 30000, // Cache data for 30 seconds
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    refetchOnWindowFocus: false,
  });
}
