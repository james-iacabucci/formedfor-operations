import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FabricationQuote } from "@/types/fabrication-quote";
import { format } from "date-fns";
import { PlusIcon, Trash2Icon } from "lucide-react";

interface SculptureFabricationQuotesProps {
  sculptureId: string;
}

type NewQuote = {
  sculpture_id: string;
  fabricator_id?: string;
  fabrication_cost: number;
  shipping_cost: number;
  customs_cost: number;
  other_cost: number;
  markup: number;
  quote_date: string;
  notes: string | null;
}

export function SculptureFabricationQuotes({ sculptureId }: SculptureFabricationQuotesProps) {
  const [isAddingQuote, setIsAddingQuote] = useState(false);
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

  const calculateTotal = (quote: Partial<FabricationQuote> | NewQuote) => {
    return (
      (quote.fabrication_cost || 0) +
      (quote.shipping_cost || 0) +
      (quote.customs_cost || 0) +
      (quote.other_cost || 0)
    );
  };

  const calculateTradePrice = (quote: Partial<FabricationQuote> | NewQuote) => {
    return calculateTotal(quote) * (quote.markup || 4);
  };

  const calculateRetailPrice = (tradePrice: number) => {
    return Math.ceil(tradePrice / (1 - 0.35) / 250) * 250;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Fabrication Quotes</h2>
        {!isAddingQuote && (
          <Button onClick={() => setIsAddingQuote(true)} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Quote
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {isAddingQuote && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fabricator</label>
                <Select
                  value={newQuote.fabricator_id}
                  onValueChange={(value) => setNewQuote({ ...newQuote, fabricator_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fabricator" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricators?.map((fabricator) => (
                      <SelectItem key={fabricator.id} value={fabricator.id}>
                        {fabricator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quote Date</label>
                <Input
                  type="date"
                  value={format(new Date(newQuote.quote_date), "yyyy-MM-dd")}
                  onChange={(e) => setNewQuote({ ...newQuote, quote_date: new Date(e.target.value).toISOString() })}
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fabrication Cost</label>
                <Input
                  type="number"
                  value={newQuote.fabrication_cost}
                  onChange={(e) => setNewQuote({ ...newQuote, fabrication_cost: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shipping Cost</label>
                <Input
                  type="number"
                  value={newQuote.shipping_cost}
                  onChange={(e) => setNewQuote({ ...newQuote, shipping_cost: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Customs Cost</label>
                <Input
                  type="number"
                  value={newQuote.customs_cost}
                  onChange={(e) => setNewQuote({ ...newQuote, customs_cost: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Other Cost</label>
                <Input
                  type="number"
                  value={newQuote.other_cost}
                  onChange={(e) => setNewQuote({ ...newQuote, other_cost: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Markup</label>
                <Input
                  type="number"
                  step="any"
                  value={newQuote.markup}
                  onChange={(e) => setNewQuote({ ...newQuote, markup: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newQuote.notes || ""}
                onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                rows={5}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  Total Cost: ${formatNumber(calculateTotal(newQuote))}
                </div>
                <div className="text-sm font-medium">
                  Trade Price: ${formatNumber(calculateTradePrice(newQuote))}
                </div>
                <div className="text-sm font-medium">
                  Retail Price: ${formatNumber(calculateRetailPrice(calculateTradePrice(newQuote)))}
                </div>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsAddingQuote(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddQuote}>
                  Save Quote
                </Button>
              </div>
            </div>
          </div>
        )}

        {quotes?.map((quote) => (
          <div key={quote.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {fabricators?.find((f) => f.id === quote.fabricator_id)?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(quote.quote_date), "PPP")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteQuote(quote.id)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-4 text-sm">
              <div>
                <p className="font-medium">Fabrication</p>
                <p>${formatNumber(quote.fabrication_cost)}</p>
              </div>
              <div>
                <p className="font-medium">Shipping</p>
                <p>${formatNumber(quote.shipping_cost)}</p>
              </div>
              <div>
                <p className="font-medium">Customs</p>
                <p>${formatNumber(quote.customs_cost)}</p>
              </div>
              <div>
                <p className="font-medium">Other</p>
                <p>${formatNumber(quote.other_cost)}</p>
              </div>
              <div>
                <p className="font-medium">Markup</p>
                <p>{quote.markup}x</p>
              </div>
            </div>

            {quote.notes && (
              <div className="text-sm">
                <p className="font-medium">Notes</p>
                <p className="whitespace-pre-line">{quote.notes}</p>
              </div>
            )}

            <div className="space-y-1 text-sm font-medium">
              <div>Total Cost: ${formatNumber(calculateTotal(quote))}</div>
              <div>Trade Price: ${formatNumber(calculateTradePrice(quote))}</div>
              <div>Retail Price: ${formatNumber(calculateRetailPrice(calculateTradePrice(quote)))}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
