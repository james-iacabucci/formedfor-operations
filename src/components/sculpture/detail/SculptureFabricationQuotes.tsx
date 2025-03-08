
import { useState } from "react";
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
  const { toast } = useToast();

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

  const { data: quotes, refetch: refetchQuotes } = useQuery({
    queryKey: ["fabrication_quotes", sculptureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fabrication_quotes")
        .select("*")
        .eq("sculpture_id", sculptureId);

      if (error) throw error;
      return data as FabricationQuote[];
    },
  });

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
      // Add physical attributes from quote
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
    });
    setIsSheetOpen(true);
  };

  const handleAddQuote = () => {
    setEditingQuoteId(null);
    setInitialQuote(undefined);
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

    await refetchQuotes();
    
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

    await refetchQuotes();
    toast({
      title: "Quote Selected",
      description: "The fabrication quote has been selected.",
    });
  };

  // Fix for the type mismatch error - create a wrapper function that returns void
  const handleQuoteSaved = async () => {
    await refetchQuotes();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Fabrication Quotes</h2>
        <Button onClick={handleAddQuote} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Quote
        </Button>
      </div>

      <div className="space-y-6">
        {quotes && sortQuotes(quotes).map((quote) => (
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
