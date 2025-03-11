
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FabricationQuote } from "@/types/fabrication-quote";
import { NewQuote } from "@/types/fabrication-quote-form";
import { PlusIcon, MessageSquareIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FabricationQuoteCard } from "./FabricationQuoteCard";
import { EditFabricationQuoteSheet } from "./EditFabricationQuoteSheet";
import { ChatSheet } from "@/components/chat/ChatSheet";
import { SculptureVariant } from "./SculptureVariant";
import { useSculptureVariants } from "@/hooks/sculpture-variants";
import {
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber
} from "@/utils/fabrication-quote-calculations";

interface SculptureFabricationQuotesProps {
  sculptureId: string;
  sculpture: any; // For accessing initial values if needed
}

export function SculptureFabricationQuotes({ sculptureId, sculpture }: SculptureFabricationQuotesProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [initialQuote, setInitialQuote] = useState<NewQuote | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatQuoteId, setActiveChatQuoteId] = useState<string | null>(null);
  const [chatThreadId, setChatThreadId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantQuotes, setVariantQuotes] = useState<FabricationQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const { toast } = useToast();

  const { 
    variants, 
    isLoading: isLoadingVariants, 
    getQuotesForVariant,
    createVariant,
    archiveVariant,
    deleteVariant,
    isCreatingVariant,
    isDeletingVariant,
    refetch: refetchVariants
  } = useSculptureVariants(sculptureId);

  // Set selected variant when variants load - only once
  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariantId) {
      console.log("Setting initial selected variant:", variants[0].id);
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  // Memoize the loadQuotes function to prevent recreating it on every render
  const loadQuotes = useCallback(async (variantId: string) => {
    if (!variantId) {
      console.log("No variant selected, not loading quotes");
      return;
    }
    
    try {
      setIsLoadingQuotes(true);
      console.log("Loading quotes for variant:", variantId);
      const quotes = await getQuotesForVariant(variantId);
      console.log("Loaded quotes:", quotes?.length || 0);
      setVariantQuotes(quotes || []);
    } catch (error) {
      console.error("Error loading quotes for variant:", error);
      toast({
        title: "Error",
        description: "Failed to load quotes for this variant",
        variant: "destructive",
      });
      setVariantQuotes([]);
    } finally {
      setIsLoadingQuotes(false);
    }
  }, [getQuotesForVariant, toast]);

  // Load quotes whenever the selected variant changes - with the memoized function
  useEffect(() => {
    if (selectedVariantId) {
      // Clear current quotes first to prevent flickering of old quotes
      setVariantQuotes([]);
      loadQuotes(selectedVariantId);
    }
  }, [selectedVariantId, loadQuotes]);

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

  const handleVariantChange = (variantId: string) => {
    console.log("Variant changed to:", variantId);
    if (variantId !== selectedVariantId) {
      setSelectedVariantId(variantId);
    }
  };

  const handleCreateVariant = async (currentVariantId: string) => {
    console.log("Creating new variant based on:", currentVariantId);
    try {
      const newVariantId = await createVariant(currentVariantId);
      console.log("New variant created, returning ID:", newVariantId);
      
      // Force a refresh of the variants list
      await refetchVariants();
      
      return newVariantId;
    } catch (error) {
      console.error("Error creating variant:", error);
      toast({
        title: "Error",
        description: "Failed to create new variant",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleArchiveVariant = async (variantId: string) => {
    try {
      await archiveVariant(variantId);
    } catch (error) {
      console.error("Error archiving variant:", error);
      toast({
        title: "Error",
        description: "Failed to archive variant",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariant(variantId);
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast({
        title: "Error",
        description: "Failed to delete variant",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sortQuotes = (quotes: FabricationQuote[]) => {
    return [...quotes].sort((a, b) => {
      if (a.is_selected) return -1;
      if (b.is_selected) return 1;
      
      return new Date(b.quote_date).getTime() - new Date(a.quote_date).getTime();
    });
  };

  const handleStartEdit = (quote: FabricationQuote) => {
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
  };

  const handleAddQuote = () => {
    if (!selectedVariantId || !variants) {
      console.error("Cannot add quote: No variant selected");
      return;
    }
    
    const selectedVariant = variants.find(v => v.id === selectedVariantId);
    if (!selectedVariant) {
      console.error("Cannot add quote: Selected variant not found");
      return;
    }
    
    console.log("Adding new quote for variant:", selectedVariant.id);
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
      material_id: selectedVariant.materialId,
      method_id: selectedVariant.methodId,
      height_in: selectedVariant.heightIn,
      width_in: selectedVariant.widthIn,
      depth_in: selectedVariant.depthIn,
      weight_kg: selectedVariant.weightKg,
      weight_lbs: selectedVariant.weightLbs,
      base_material_id: selectedVariant.baseMaterialId,
      base_method_id: selectedVariant.baseMethodId,
      base_height_in: selectedVariant.baseHeightIn,
      base_width_in: selectedVariant.baseWidthIn,
      base_depth_in: selectedVariant.baseDepthIn,
      base_weight_kg: selectedVariant.baseWeightKg,
      base_weight_lbs: selectedVariant.baseWeightLbs,
      variant_id: selectedVariant.id
    });
    setIsSheetOpen(true);
  };

  const handleDeleteQuote = async (quoteId: string) => {
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

    // Remove from local state immediately for a faster UI update
    setVariantQuotes(current => current.filter(q => q.id !== quoteId));
    
    toast({
      title: "Success",
      description: "Quote deleted successfully",
    });
  };

  const handleSelectQuote = async (quoteId: string) => {
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

    // Update the local state immediately for faster UI feedback
    setVariantQuotes(current => 
      current.map(q => ({
        ...q,
        is_selected: q.id === quoteId
      }))
    );
    
    toast({
      title: "Quote Selected",
      description: "The fabrication quote has been selected.",
    });
  };

  const handleQuoteSaved = async () => {
    if (selectedVariantId) {
      loadQuotes(selectedVariantId);
    }
  };

  const handleOpenChat = async (quoteId: string) => {
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
  };

  if (isLoadingVariants) {
    return <div className="py-4">Loading variants...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Variant selection and management */}
      {variants && variants.length > 0 && (
        <SculptureVariant 
          variants={variants}
          onVariantChange={handleVariantChange}
          selectedVariantId={selectedVariantId}
          onCreateVariant={handleCreateVariant}
          onArchiveVariant={handleArchiveVariant}
          onDeleteVariant={handleDeleteVariant}
          isCreatingVariant={isCreatingVariant}
          isDeletingVariant={isDeletingVariant}
        />
      )}

      {/* Fabrication quotes section - Always show header */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Fabrication Quotes</h2>
          <Button onClick={handleAddQuote} size="sm" disabled={!selectedVariantId}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Quote
          </Button>
        </div>

        {/* Only show the loading or empty state and quotes list if variant is selected */}
        {selectedVariantId && (
          <>
            {/* Loading state */}
            {isLoadingQuotes && (
              <div className="text-center py-8 text-muted-foreground">
                Loading quotes...
              </div>
            )}

            {/* Empty state - only shown when not loading and no quotes */}
            {!isLoadingQuotes && variantQuotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No quotes available for this variant. Click "Add Quote" to create one.
              </div>
            )}

            {/* Quotes list - only shown when not loading and has quotes */}
            {!isLoadingQuotes && variantQuotes.length > 0 && (
              <div className="space-y-6">
                {sortQuotes(variantQuotes).map((quote) => (
                  <FabricationQuoteCard
                    key={quote.id}
                    quote={quote}
                    fabricatorName={fabricators?.find((f) => f.id === quote.fabricator_id)?.name}
                    onSelect={() => handleSelectQuote(quote.id)}
                    onEdit={() => handleStartEdit(quote)}
                    onDelete={() => handleDeleteQuote(quote.id)}
                    onChat={() => handleOpenChat(quote.id)}
                    calculateTotal={calculateTotal}
                    calculateTradePrice={calculateTradePrice}
                    calculateRetailPrice={calculateRetailPrice}
                    formatNumber={formatNumber}
                    isEditing={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit quote sheet */}
      <EditFabricationQuoteSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        sculptureId={sculptureId}
        editingQuoteId={editingQuoteId}
        fabricators={fabricators || []}
        onQuoteSaved={handleQuoteSaved}
        initialQuote={initialQuote}
      />

      {/* Chat sheet */}
      {chatThreadId && (
        <ChatSheet 
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
          threadId={chatThreadId}
          quoteMode={true}
        />
      )}
    </div>
  );
}
