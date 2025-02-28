
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NewQuote } from "@/types/fabrication-quote-form";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FabricationQuoteFormProps {
  sculptureId: string;
  onCancel: () => void;
  onSuccess: () => void;
  editingQuoteId?: string | null;
}

export function FabricationQuoteForm({
  sculptureId,
  onCancel,
  onSuccess,
  editingQuoteId = null
}: FabricationQuoteFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fabricators, setFabricators] = useState([]);
  const [newQuote, setNewQuote] = useState<NewQuote>({
    fabricator_id: "",
    quote_date: new Date().toISOString(),
    fabrication_cost: 0,
    shipping_cost: 0,
    customs_cost: 0,
    other_cost: 0,
    markup: 2.5,
    notes: "",
    sculpture_id: sculptureId
  });

  // Calculate total cost
  const calculateTotal = (quote: NewQuote) => {
    return quote.fabrication_cost + quote.shipping_cost + quote.customs_cost + quote.other_cost;
  };

  // Calculate trade price
  const calculateTradePrice = (quote: NewQuote) => {
    return calculateTotal(quote) * quote.markup;
  };

  // Calculate retail price (2x trade price)
  const calculateRetailPrice = (tradePrice: number) => {
    return tradePrice * 2;
  };

  // Format number to 2 decimal places
  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Fetch fabricators
  useEffect(() => {
    const fetchFabricators = async () => {
      const { data, error } = await supabase
        .from("fabricators")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching fabricators:", error);
        return;
      }
      
      setFabricators(data || []);

      // If there are fabricators and none is selected, select the first one
      if (data?.length > 0 && !newQuote.fabricator_id) {
        setNewQuote(prev => ({
          ...prev,
          fabricator_id: data[0].id
        }));
      }
    };

    fetchFabricators();
  }, []);

  // If editing, fetch the quote data
  useEffect(() => {
    if (editingQuoteId) {
      const fetchQuote = async () => {
        const { data, error } = await supabase
          .from("fabrication_quotes")
          .select("*")
          .eq("id", editingQuoteId)
          .single();
        
        if (error) {
          console.error("Error fetching quote:", error);
          return;
        }
        
        setNewQuote({
          fabricator_id: data.fabricator_id,
          quote_date: data.quote_date,
          fabrication_cost: data.fabrication_cost,
          shipping_cost: data.shipping_cost,
          customs_cost: data.customs_cost,
          other_cost: data.other_cost,
          markup: data.markup,
          notes: data.notes,
          sculpture_id: sculptureId
        });
      };

      fetchQuote();
    }
  }, [editingQuoteId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof NewQuote
  ) => {
    const value = e.target.value;
    if (field === 'notes') {
      setNewQuote({ ...newQuote, [field]: value });
    } else {
      const numValue = value ? parseFloat(value) : 0;
      setNewQuote({ ...newQuote, [field]: numValue });
    }
  };

  const handleSave = async () => {
    try {
      if (editingQuoteId) {
        // Update existing quote
        const { error } = await supabase
          .from("fabrication_quotes")
          .update({
            fabricator_id: newQuote.fabricator_id,
            quote_date: newQuote.quote_date,
            fabrication_cost: newQuote.fabrication_cost,
            shipping_cost: newQuote.shipping_cost,
            customs_cost: newQuote.customs_cost,
            other_cost: newQuote.other_cost,
            markup: newQuote.markup,
            notes: newQuote.notes
          })
          .eq("id", editingQuoteId);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Quote updated successfully",
        });
      } else {
        // Create new quote
        const { error } = await supabase
          .from("fabrication_quotes")
          .insert([{
            sculpture_id: sculptureId,
            fabricator_id: newQuote.fabricator_id,
            quote_date: newQuote.quote_date,
            fabrication_cost: newQuote.fabrication_cost,
            shipping_cost: newQuote.shipping_cost,
            customs_cost: newQuote.customs_cost,
            other_cost: newQuote.other_cost,
            markup: newQuote.markup,
            notes: newQuote.notes,
            is_selected: false
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Quote added successfully",
        });
      }
      
      // Invalidate and refetch quotes
      await queryClient.invalidateQueries({ queryKey: ["fabrication-quotes", sculptureId] });
      
      // Call onSuccess callback
      onSuccess();
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Fabricator</label>
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
          <label className="text-sm font-medium text-muted-foreground">Quote Date</label>
          <Input
            type="date"
            value={format(new Date(newQuote.quote_date), "yyyy-MM-dd")}
            onChange={(e) => setNewQuote({ ...newQuote, quote_date: new Date(e.target.value).toISOString() })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Fabrication</label>
            <Input
              type="number"
              value={newQuote.fabrication_cost}
              onChange={(e) => handleInputChange(e, 'fabrication_cost')}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Shipping</label>
            <Input
              type="number"
              value={newQuote.shipping_cost}
              onChange={(e) => handleInputChange(e, 'shipping_cost')}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Customs</label>
            <Input
              type="number"
              value={newQuote.customs_cost}
              onChange={(e) => handleInputChange(e, 'customs_cost')}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Other</label>
            <Input
              type="number"
              value={newQuote.other_cost}
              onChange={(e) => handleInputChange(e, 'other_cost')}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
            <Input
              type="text"
              value={`$${formatNumber(calculateTotal(newQuote))}`}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Markup</label>
            <Input
              type="number"
              step="any"
              value={newQuote.markup}
              onChange={(e) => handleInputChange(e, 'markup')}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Trade Price</label>
            <Input
              type="text"
              value={`$${formatNumber(calculateTradePrice(newQuote))}`}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Retail Price</label>
            <Input
              type="text"
              value={`$${formatNumber(calculateRetailPrice(calculateTradePrice(newQuote)))}`}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="col-span-2" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Notes</label>
        <Textarea
          value={newQuote.notes || ""}
          onChange={(e) => handleInputChange(e, 'notes')}
          rows={5}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {editingQuoteId ? "Save Changes" : "Save Quote"}
        </Button>
      </div>
    </div>
  );
}
