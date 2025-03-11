
import { useCallback } from "react";
import { useVariantQuotesQuery } from "@/hooks/sculpture-variants/useVariantQuotesQuery";
import { useQuoteSelection } from "./useQuoteSelection";
import { useQuoteDeletion } from "./useQuoteDeletion";
import { useQuoteEditing } from "./useQuoteEditing";
import { useQuoteChat } from "./useQuoteChat";

export function useFabricationQuotes(sculptureId: string, selectedVariantId: string | null) {
  // Use the query hook for variant quotes
  const {
    data: quotes = [],
    isLoading: isLoadingQuotes,
    isError: isQuotesError,
    refetch: refetchQuotes
  } = useVariantQuotesQuery(selectedVariantId);

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
  } = useQuoteChat(sculptureId);

  const handleQuoteSaved = useCallback(async () => {
    if (selectedVariantId) {
      await refetchQuotes();
    }
  }, [selectedVariantId, refetchQuotes]);

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
    handleSelectQuote,
    handleDeleteQuote,
    handleStartEdit,
    handleAddQuote: (variant: any) => handleAddQuote(sculptureId, variant),
    handleOpenChat,
    handleQuoteSaved,
  };
}
