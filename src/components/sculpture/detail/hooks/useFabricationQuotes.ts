
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FabricationQuote } from "@/types/fabrication-quote";
import { NewQuote } from "@/types/fabrication-quote-form";
import { useVariantQuotesQuery } from "@/hooks/sculpture-variants/useVariantQuotesQuery";

export function useFabricationQuotes(sculptureId: string, selectedVariantId: string | null) {
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [initialQuote, setInitialQuote] = useState<NewQuote | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatQuoteId, setActiveChatQuoteId] = useState<string | null>(null);
  const [chatThreadId, setChatThreadId] = useState<string | null>(null);
  const { toast } = useToast();

  // Use the query hook for variant quotes
  const {
    data: quotes = [],
    isLoading: isLoadingQuotes,
    isError: isQuotesError,
    refetch: refetchQuotes
  } = useVariantQuotesQuery(selectedVariantId);

  const handleSelectQuote = useCallback(async (quoteId: string) => {
    const { error } = await supabase
      .from("fabrication_quotes")
      .update({ is_selected: true })
      .eq("id", quoteId);

    if (error) {
      console.error("Error selecting quote:", error);
      toast({
        title: "Error",
        description: "Failed to select quote. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Refresh quotes after selection
    refetchQuotes();
    
    toast({
      title: "Quote Selected",
      description: "The fabrication quote has been selected.",
    });
  }, [refetchQuotes, toast]);

  const handleDeleteQuote = useCallback(async (quoteId: string) => {
    const { error } = await supabase
      .from("fabrication_quotes")
      .delete()
      .eq("id", quoteId);

    if (error) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Error",
        description: "Failed to delete quote: " + error.message,
        variant: "destructive",
      });
      return;
    }

    // Refetch quotes after deletion
    refetchQuotes();
    
    toast({
      title: "Success",
      description: "Quote deleted successfully",
    });
  }, [refetchQuotes, toast]);

  const handleStartEdit = useCallback((quote: FabricationQuote) => {
    setEditingQuoteId(quote.id);
    setInitialQuote({
      sculpture_id: quote.sculpture_id,
      fabricator_id: quote.fabricator_id,
      fabrication_cost: quote.fabrication_cost,
      shipping_cost: quote.shipping_cost,
      customs_cost: quote.customs_cost,
      other_cost: quote.other_cost,
      markup: quote.markup,
      notes: quote.notes,
      quote_date: quote.quote_date,
      status: quote.status, // Make sure status is included here
      material_id: quote.material_id,
      method_id: quote.method_id,
      height_in: quote.height_in,
      width_in: quote.width_in,
      depth_in: quote.depth_in,
      weight_kg: quote.weight_kg,
      weight_lbs: quote.weight_lbs,
      base_material_id: quote.base_material_id,
      base_method_id: quote.base_method_id,
      base_height_in: quote.base_height_in,
      base_width_in: quote.base_width_in,
      base_depth_in: quote.base_depth_in,
      base_weight_kg: quote.base_weight_kg,
      base_weight_lbs: quote.base_weight_lbs,
      variant_id: quote.variant_id
    });
    setIsSheetOpen(true);
  }, []);

  const handleAddQuote = useCallback((variant: any) => {
    if (!variant) {
      console.error("Cannot add quote: Selected variant not found");
      return;
    }
    
    console.log("Adding new quote for variant:", variant.id);
    setEditingQuoteId(null);
    setInitialQuote({
      sculpture_id: sculptureId,
      fabricator_id: undefined,
      fabrication_cost: 500,
      shipping_cost: 0,
      customs_cost: 0,
      other_cost: 0,
      markup: 4,
      notes: "",
      quote_date: new Date().toISOString(),
      status: "requested", // Make sure status is included here
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
    });
    setIsSheetOpen(true);
  }, [sculptureId]);

  const handleOpenChat = useCallback(async (quoteId: string) => {
    try {
      const { data: existingThreads, error: fetchError } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("fabrication_quote_id", quoteId)
        .limit(1);

      if (fetchError) throw fetchError;

      let threadId;

      if (existingThreads && existingThreads.length > 0) {
        threadId = existingThreads[0].id;
      } else {
        const { data: newThread, error: createError } = await supabase
          .from("chat_threads")
          .insert({
            fabrication_quote_id: quoteId,
            sculpture_id: sculptureId,
            topic: 'general'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        threadId = newThread.id;

        const { error: participantError } = await supabase
          .from("chat_thread_participants")
          .insert({
            thread_id: threadId,
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
          });

        if (participantError) {
          console.error("Error adding participant:", participantError);
        }
      }

      setChatThreadId(threadId);
      setActiveChatQuoteId(quoteId);
      setIsChatOpen(true);
    } catch (error) {
      console.error("Error preparing chat:", error);
      toast({
        title: "Error",
        description: "Failed to open chat. Please try again.",
        variant: "destructive",
      });
    }
  }, [sculptureId, toast]);

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
    handleAddQuote,
    handleOpenChat,
    handleQuoteSaved,
  };
}
