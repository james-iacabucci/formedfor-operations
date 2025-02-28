import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FabricationQuote } from "@/types/fabrication-quote";
import { NewQuote } from "@/types/fabrication-quote-form";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FabricationQuoteForm } from "./FabricationQuoteForm";
import { FabricationQuoteCard } from "./FabricationQuoteCard";
import {
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber
} from "@/utils/fabrication-quote-calculations";

interface SculptureFabricationQuotesProps {
  sculptureId: string;
}

export function SculptureFabricationQuotes({ sculptureId }: SculptureFabricationQuotesProps) {
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const { toast } = useToast();
  const [newQuote, setNewQuote] = useState<NewQuote>({
    sculpture_id: sculptureId,
    fabrication_cost: 500,
    shipping_cost: 0,
    customs_cost: 0,
    other_cost: 0,
    markup: 4,
    notes: "",
    quote_date: new Date().toISOString(),
  });

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
    setNewQuote({
      sculpture_id: quote.sculpture_id,
      fabricator_id: quote.fabricator_id,
      fabrication_cost: quote.fabrication_cost,
      shipping_cost: quote.shipping_cost,
      customs_cost: quote.customs_cost,
      other_cost: quote.other_cost,
      markup: quote.markup,
      notes: quote.notes,
      quote_date: quote.quote_date,
    });
    setIsAddingQuote(false);
  };

  const handleSaveEdit = async () => {
    if (!editingQuoteId || !newQuote.fabricator_id) return;

    const { error } = await supabase
      .from("fabrication_quotes")
      .update({
        fabricator_id: newQuote.fabricator_id,
        fabrication_cost: newQuote.fabrication_cost,
        shipping_cost: newQuote.shipping_cost,
        customs_cost: newQuote.customs_cost,
        other_cost: newQuote.other_cost,
        markup: newQuote.markup,
        notes: newQuote.notes,
        quote_date: newQuote.quote_date,
      })
      .eq("id", editingQuoteId);

    if (error) {
      console.error("Error updating quote:", error);
      return;
    }

    await refetchQuotes();
    setEditingQuoteId(null);
    resetNewQuote();
  };

  const handleAddQuote = async () => {
    if (!newQuote.fabricator_id) return;

    const quoteToInsert = {
      ...newQuote,
      fabricator_id: newQuote.fabricator_id,
      sculpture_id: sculptureId,
    };

    const { error } = await supabase
      .from("fabrication_quotes")
      .insert(quoteToInsert);

    if (error) {
      console.error("Error adding quote:", error);
      return;
    }

    await refetchQuotes();
    setIsAddingQuote(false);
    resetNewQuote();
  };

  const handleDeleteQuote = async (quoteId: string) => {
    const { error } = await supabase
      .from("fabrication_quotes")
      .delete()
      .eq("id", quoteId);

    if (error) {
      console.error("Error deleting quote:", error);
      return;
    }

    await refetchQuotes();
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

  const resetNewQuote = () => {
    setNewQuote({
      sculpture_id: sculptureId,
      fabrication_cost: 500,
      shipping_cost: 0,
      customs_cost: 0,
      other_cost: 0,
      markup: 4,
      notes: "",
      quote_date: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Fabrication Quotes</h2>
        {!isAddingQuote && !editingQuoteId && (
          <Button onClick={() => setIsAddingQuote(true)} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Quote
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {(isAddingQuote || editingQuoteId) && (
          <FabricationQuoteForm
            newQuote={newQuote}
            onQuoteChange={setNewQuote}
            onSave={editingQuoteId ? handleSaveEdit : handleAddQuote}
            onCancel={() => {
              setIsAddingQuote(false);
              setEditingQuoteId(null);
              resetNewQuote();
            }}
            fabricators={fabricators || []}
            editingQuoteId={editingQuoteId}
            calculateTotal={calculateTotal}
            calculateTradePrice={calculateTradePrice}
            calculateRetailPrice={calculateRetailPrice}
            formatNumber={formatNumber}
          />
        )}

        {quotes && sortQuotes(quotes).map((quote) => (
          <FabricationQuoteCard
            key={quote.id}
            quote={quote}
            fabricatorName={fabricators?.find((f) => f.id === quote.fabricator_id)?.name}
            onSelect={() => handleSelectQuote(quote.id)}
            onEdit={() => handleStartEdit(quote)}
            onDelete={() => handleDeleteQuote(quote.id)}
            calculateTotal={calculateTotal}
            calculateTradePrice={calculateTradePrice}
            calculateRetailPrice={calculateRetailPrice}
            formatNumber={formatNumber}
            isEditing={editingQuoteId === quote.id}
          />
        ))}
      </div>
    </div>
  );
}
