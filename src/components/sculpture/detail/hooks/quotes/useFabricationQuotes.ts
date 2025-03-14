
import { useCallback, useState } from "react";
import { useVariantQuotesQuery } from "@/hooks/sculpture-variants/useVariantQuotesQuery";
import { useQuoteSelection } from "./useQuoteSelection";
import { useQuoteDeletion } from "./useQuoteDeletion";
import { useQuoteEditing } from "./useQuoteEditing";
import { useQuoteChat } from "./useQuoteChat";
import { useQuoteSave } from "./useQuoteSave";
import { NewQuote } from "@/types/fabrication-quote-form";
import { supabase } from "@/integrations/supabase/client";

export function useFabricationQuotes(sculptureId: string, selectedVariantId: string | null) {
  // Use the query hook for variant quotes
  const {
    data: quotes = [],
    isLoading: isLoadingQuotes,
    isError: isQuotesError,
    refetch: refetchQuotesQuery
  } = useVariantQuotesQuery(selectedVariantId);

  // State for request quote dialog
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const { saveQuote } = useQuoteSave();

  // Create a wrapper function to ensure correct Promise<void> return type
  const refetchQuotes = useCallback(async () => {
    await refetchQuotesQuery();
  }, [refetchQuotesQuery]);

  // Use smaller hooks for specific functionalities
  const { handleSelectQuote } = useQuoteSelection(refetchQuotes);
  const { handleDeleteQuote } = useQuoteDeletion(refetchQuotes);
  const { 
    editingQuoteId, 
    initialQuote, 
    isSheetOpen, 
    setIsSheetOpen, 
    handleStartEdit, 
    handleAddQuote 
  } = useQuoteEditing();
  const { 
    isChatOpen, 
    setIsChatOpen, 
    chatThreadId, 
    handleOpenChat 
  } = useQuoteChat(sculptureId, selectedVariantId);

  const handleQuoteSaved = useCallback(async () => {
    if (selectedVariantId) {
      await refetchQuotes();
    }
  }, [selectedVariantId, refetchQuotes]);

  // New method to handle quote requests
  const handleQuoteRequest = useCallback(async (fabricatorId: string, notes: string) => {
    if (!selectedVariantId) return;
    
    const variant = await (async () => {
      try {
        const { data: variant } = await supabase
          .from('sculpture_variants')
          .select('*')
          .eq('id', selectedVariantId)
          .single();
        return variant;
      } catch (error) {
        console.error("Error fetching variant details:", error);
        return null;
      }
    })();
    
    if (!variant) return;
    
    // Create a minimal quote with just fabricator and notes
    const newQuote: NewQuote = {
      sculpture_id: sculptureId,
      fabricator_id: fabricatorId,
      fabrication_cost: null,
      shipping_cost: null,
      customs_cost: null,
      other_cost: null,
      markup: 4, // Default markup
      notes: notes,
      quote_date: new Date().toISOString(),
      material_id: variant.materialId,
      method_id: variant.methodId,
      height_in: variant.heightIn,
      width_in: variant.widthIn,
      depth_in: variant.depthIn,
      weight_kg: variant.weightKg,
      weight_lbs: variant.weightLbs,
      base_material_id: variant.baseMaterialId,
      base_method_id: variant.baseMethodId,
      base_height_in: variant.baseHeightIn,
      base_width_in: variant.baseWidthIn,
      base_depth_in: variant.baseDepthIn,
      base_weight_kg: variant.baseWeightKg,
      base_weight_lbs: variant.baseWeightLbs,
      variant_id: variant.id
    };
    
    await saveQuote(newQuote, null, refetchQuotes);
  }, [sculptureId, selectedVariantId, saveQuote, refetchQuotes]);

  return {
    quotes,
    isLoadingQuotes,
    isQuotesError,
    refetchQuotes,
    editingQuoteId,
    initialQuote,
    isSheetOpen,
    setIsSheetOpen,
    isChatOpen,
    setIsChatOpen,
    chatThreadId,
    isRequestDialogOpen,
    setIsRequestDialogOpen,
    handleSelectQuote,
    handleDeleteQuote,
    handleStartEdit,
    handleAddQuote: (variant: any) => handleAddQuote(sculptureId, variant),
    handleOpenChat,
    handleQuoteSaved,
    handleQuoteRequest
  };
}
