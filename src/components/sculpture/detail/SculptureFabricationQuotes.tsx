
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
  sculpture: any; // For accessing initial values if needed
}

export function SculptureFabricationQuotes({ sculptureId, sculpture }: SculptureFabricationQuotesProps) {
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
    // Add new fields from sculpture
    material_id: null,
    method_id: null,
    height_in: null,
    width_in: null,
    depth_in: null,
    weight_kg: null,
    weight_lbs: null,
    base_material_id: null,
    base_method_id: null,
    base_height_in: null,
    base_width_in: null,
    base_depth_in: null,
    base_weight_kg: null,
    base_weight_lbs: null,
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
        // Include physical attributes
        material_id: newQuote.material_id,
        method_id: newQuote.method_id,
        height_in: newQuote.height_in,
        width_in: newQuote.width_in,
        depth_in: newQuote.depth_in,
        weight_kg: newQuote.weight_kg,
        weight_lbs: newQuote.weight_lbs,
        base_material_id: newQuote.base_material_id,
        base_method_id: newQuote.base_method_id,
        base_height_in: newQuote.base_height_in,
        base_width_in: newQuote.base_width_in,
        base_depth_in: newQuote.base_depth_in,
        base_weight_kg: newQuote.base_weight_kg,
        base_weight_lbs: newQuote.base_weight_lbs,
      })
      .eq("id", editingQuoteId);

    if (error) {
      console.error("Error updating quote:", error);
      toast({
        title: "Error",
        description: "Failed to update quote: " + error.message,
        variant: "destructive",
      });
      return;
    }

    await refetchQuotes();
    setEditingQuoteId(null);
    resetNewQuote();
    
    toast({
      title: "Success",
      description: "Quote updated successfully",
    });
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
      toast({
        title: "Error",
        description: "Failed to add quote: " + error.message,
        variant: "destructive",
      });
      return;
    }

    await refetchQuotes();
    setIsAddingQuote(false);
    resetNewQuote();
    
    toast({
      title: "Success",
      description: "Quote added successfully",
    });
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
      // Reset physical attributes
      material_id: null,
      method_id: null,
      height_in: null,
      width_in: null,
      depth_in: null,
      weight_kg: null,
      weight_lbs: null,
      base_material_id: null,
      base_method_id: null,
      base_height_in: null,
      base_width_in: null,
      base_depth_in: null,
      base_weight_kg: null,
      base_weight_lbs: null,
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
