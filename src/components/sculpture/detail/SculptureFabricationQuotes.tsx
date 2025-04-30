
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditFabricationQuoteSheet } from "./EditFabricationQuoteSheet";
import { ChatSheet } from "@/components/chat/ChatSheet";
import { SculptureVariant } from "./SculptureVariant";
import { useSculptureVariants } from "@/hooks/sculpture-variants";
import { useFabricationQuotes } from "./hooks/quotes/useFabricationQuotes";
import { Skeleton } from "@/components/ui/skeleton";
import {
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber
} from "@/utils/fabrication-quote-calculations";
import { FabricationQuotesHeader } from "./components/FabricationQuotesHeader";
import { VariantQuotesSection } from "./components/VariantQuotesSection";
import { RequestQuoteDialog } from "./components/RequestQuoteDialog";

interface SculptureFabricationQuotesProps {
  sculptureId: string;
  sculpture: any; // For accessing initial values if needed
}

export function SculptureFabricationQuotes({ sculptureId, sculpture }: SculptureFabricationQuotesProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const { 
    variants, 
    isLoading: isLoadingVariants, 
    createVariant,
    archiveVariant,
    deleteVariant,
    isCreatingVariant,
    isDeletingVariant,
    refetch: refetchVariants
  } = useSculptureVariants(sculptureId);

  const {
    quotes,
    isLoadingQuotes,
    isQuotesError,
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
    handleOpenChat,
    handleQuoteSaved,
    handleQuoteRequest,
    handleSubmitForApproval,
    handleApproveQuote,
    handleRejectQuote,
    handleRequoteQuote
  } = useFabricationQuotes(sculptureId, selectedVariantId);

  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariantId) {
      console.log("Setting initial selected variant:", variants[0].id);
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  const { data: fabricators } = useQuery({
    queryKey: ["value_lists", "fabricator"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "fabricator");

      if (error) throw error;
      return data;
    },
  });

  const handleVariantChange = useCallback((variantId: string) => {
    console.log("Variant changed to:", variantId);
    if (variantId !== selectedVariantId) {
      setSelectedVariantId(variantId);
    }
  }, [selectedVariantId]);

  const handleCreateVariant = useCallback(async (currentVariantId: string) => {
    try {
      const newVariantId = await createVariant(currentVariantId);
      
      await refetchVariants();
      
      return newVariantId;
    } catch (error) {
      console.error("Error creating variant:", error);
      throw error;
    }
  }, [createVariant, refetchVariants]);

  const currentVariant = useMemo(() => {
    if (!variants || !selectedVariantId) return null;
    return variants.find(v => v.id === selectedVariantId) || null;
  }, [variants, selectedVariantId]);

  if (isLoadingVariants) {
    return (
      <div className="space-y-6">
        <div className="py-4 space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {variants && variants.length > 0 && (
        <SculptureVariant 
          variants={variants}
          onVariantChange={handleVariantChange}
          selectedVariantId={selectedVariantId}
          onCreateVariant={handleCreateVariant}
          onArchiveVariant={archiveVariant}
          onDeleteVariant={deleteVariant}
          isCreatingVariant={isCreatingVariant}
          isDeletingVariant={isDeletingVariant}
        />
      )}

      <div className="space-y-6">
        <FabricationQuotesHeader
          onAddQuote={() => setIsRequestDialogOpen(true)}
          onOpenChat={handleOpenChat}
          disabled={!selectedVariantId}
        />

        <VariantQuotesSection
          selectedVariantId={selectedVariantId}
          quotes={quotes}
          isLoadingQuotes={isLoadingQuotes}
          isQuotesError={isQuotesError}
          fabricators={fabricators || []}
          handleSelectQuote={handleSelectQuote}
          handleStartEdit={handleStartEdit}
          handleDeleteQuote={handleDeleteQuote}
          handleSubmitForApproval={handleSubmitForApproval}
          handleApproveQuote={handleApproveQuote}
          handleRejectQuote={handleRejectQuote}
          handleRequoteQuote={handleRequoteQuote}
          calculateTotal={calculateTotal}
          calculateTradePrice={calculateTradePrice}
          calculateRetailPrice={calculateRetailPrice}
          formatNumber={formatNumber}
        />
      </div>

      <EditFabricationQuoteSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        sculptureId={sculptureId}
        editingQuoteId={editingQuoteId}
        fabricators={fabricators || []}
        onQuoteSaved={handleQuoteSaved}
        initialQuote={initialQuote}
        onSubmitForApproval={handleSubmitForApproval}
      />

      <RequestQuoteDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        fabricators={fabricators || []}
        onRequestSubmit={handleQuoteRequest}
      />

      {chatThreadId && (
        <ChatSheet 
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
          threadId={chatThreadId}
          sculptureId={sculptureId}
          quoteMode={true}
          variantId={selectedVariantId}
        />
      )}
    </div>
  );
}
