
import { useQueryClient } from "@tanstack/react-query";
import { useVariantsQuery } from "./useVariantsQuery";
import { useVariantQuotes } from "./useVariantQuotes";
import { useVariantMutations } from "./useVariantMutations";
import { UseSculptureVariantsReturn } from "./types";

export function useSculptureVariants(sculptureId: string): UseSculptureVariantsReturn {
  const queryClient = useQueryClient();
  
  const { 
    data: variants, 
    isLoading, 
    refetch
  } = useVariantsQuery(sculptureId);
  
  const { getQuotesForVariant } = useVariantQuotes(sculptureId, variants);
  
  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
    return refetch();
  };
  
  const { 
    createVariant,
    archiveVariant,
    deleteVariant,
    isCreatingVariant,
    isArchivingVariant,
    isDeletingVariant
  } = useVariantMutations(sculptureId, variants, invalidateQueries);

  return {
    variants,
    isLoading,
    refetch,
    getQuotesForVariant,
    createVariant,
    archiveVariant,
    deleteVariant,
    isCreatingVariant,
    isArchivingVariant,
    isDeletingVariant
  };
}

// Re-export the types
export * from "./types";
