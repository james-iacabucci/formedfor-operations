
import { useState, useEffect } from "react";
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
import { useSculptureVariants } from "@/hooks/useSculptureVariants";
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
  const { toast } = useToast();

  // Get variants for this sculpture with the enhanced hook functions
  const { 
    variants, 
    isLoading: isLoadingVariants, 
    getQuotesForVariant,
    createVariant,
    archiveVariant,
    deleteVariant,
    isCreatingVariant,
    isDeletingVariant
  } = useSculptureVariants(sculptureId);

  // Set initial selected variant when variants load
  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  // When selected variant changes, fetch its quotes
  useEffect(() => {
    const loadQuotes = async () => {
      if (selectedVariantId) {
        try {
          const quotes = await getQuotesForVariant(selectedVariantId);
          setVariantQuotes(quotes || []);
        } catch (error) {
          console.error("Error loading quotes for variant:", error);
          toast({
            title: "Error",
            description: "Failed to load quotes for this variant",
            variant: "destructive",
          });
          setVariantQuotes([]);
        }
      }
    };
    
    loadQuotes();
  }, [selectedVariantId, getQuotesForVariant, toast]);

  // Get fabricators for dropdowns
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

  const handleVariantChange = async (variantId: string) => {
    setSelectedVariantId(variantId);
    try {
      const quotes = await getQuotesForVariant(variantId);
      setVariantQuotes(quotes || []);
    } catch (error) {
      console.error("Error changing variant:", error);
      toast({
        title: "Error",
        description: "Failed to load quotes for this variant",
        variant: "destructive",
      });
      setVariantQuotes([]);
    }
  };

  const handleCreateVariant = async (currentVariantId: string) => {
    try {
      const newVariantId = await createVariant(currentVariantId);
      return newVariantId;
    } catch (error) {
      console.error("Error creating variant:", error);
      toast({
        title: "Error",
        description: "Failed to create new variant",
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the caller
    }
  };

  const handleArchiveVariant = async (variantId: string) => {
    try {
      await archiveVariant(variantId);
      // The queryClient.invalidateQueries in the hook will refresh the variants
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
      // The queryClient.invalidateQueries in the hook will refresh the variants
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
      // Selected quote comes first
      if (a.is_selected) return -1;
      if (b.is_selected) return 1;
      
      // Then sort by date descending
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
      // Add physical attributes from quote - these will be pre-filled from the variant
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
    if (!selectedVariantId || !variants) return;
    
    // Find the selected variant
    const selectedVariant = variants.find(v => v.id === selectedVariantId);
    if (!selectedVariant) return;
    
    // Pre-fill the form with variant details
    setEditingQuoteId(null);
    setInitialQuote({
      sculpture_id: sculptureId,
      fabricator_id: undefined, // User must select this
      fabrication_cost: 500,
      shipping_cost: 0,
      customs_cost: 0,
      other_cost: 0,
      markup: 4,
      notes: "",
      quote_date: new Date().toISOString(),
      // Pre-fill physical attributes from the selected variant
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
      variant_id: selectedVariant.id // Set the variant_id field
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

    // Refresh quotes for the current variant
    const updatedQuotes = await getQuotesForVariant(selectedVariantId!);
    setVariantQuotes(updatedQuotes);
    
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

    // Refresh quotes for the current variant
    const updatedQuotes = await getQuotesForVariant(selectedVariantId!);
    setVariantQuotes(updatedQuotes);
    
    toast({
      title: "Quote Selected",
      description: "The fabrication quote has been selected.",
    });
  };

  const handleQuoteSaved = async () => {
    // Refresh quotes for the current variant
    const updatedQuotes = await getQuotesForVariant(selectedVariantId!);
    setVariantQuotes(updatedQuotes);
  };

  const handleOpenChat = async (quoteId: string) => {
    try {
      // Check if there's already a thread for this quote
      const { data: existingThreads, error: fetchError } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("fabrication_quote_id", quoteId)
        .limit(1);

      if (fetchError) throw fetchError;

      let threadId;

      if (existingThreads && existingThreads.length > 0) {
        // Use existing thread
        threadId = existingThreads[0].id;
      } else {
        // Create a new thread for this quote
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

        // Auto-add the user as a participant
        const { error: participantError } = await supabase
          .from("chat_thread_participants")
          .insert({
            thread_id: threadId,
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
          });

        if (participantError) {
          console.error("Error adding participant:", participantError);
          // Continue anyway, not critical
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
      {/* Variants Section */}
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

      {/* Fabrication Quotes for Selected Variant */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Fabrication Quotes</h2>
          <Button onClick={handleAddQuote} size="sm" disabled={!selectedVariantId}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Quote
          </Button>
        </div>

        {selectedVariantId && variantQuotes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No quotes available for this variant. Click "Add Quote" to create one.
          </div>
        )}

        <div className="space-y-6">
          {variantQuotes && sortQuotes(variantQuotes).map((quote) => (
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
      </div>

      <EditFabricationQuoteSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        sculptureId={sculptureId}
        editingQuoteId={editingQuoteId}
        fabricators={fabricators || []}
        onQuoteSaved={handleQuoteSaved}
        initialQuote={initialQuote}
      />

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
