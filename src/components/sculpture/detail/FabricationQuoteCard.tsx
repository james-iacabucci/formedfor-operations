
import { Button } from "@/components/ui/button";
import { FabricationQuote } from "@/types/fabrication-quote";
import { format } from "date-fns";
import { PencilIcon, Trash2Icon, CheckCircle2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FabricationQuoteCardProps {
  quote: FabricationQuote;
}

export function FabricationQuoteCard({ quote }: FabricationQuoteCardProps) {
  const [fabricatorName, setFabricatorName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Format number to 2 decimal places
  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate total cost
  const calculateTotal = (quote: FabricationQuote) => {
    return quote.fabrication_cost + quote.shipping_cost + quote.customs_cost + quote.other_cost;
  };

  // Calculate trade price
  const calculateTradePrice = (quote: FabricationQuote) => {
    return calculateTotal(quote) * quote.markup;
  };

  // Calculate retail price (2x trade price)
  const calculateRetailPrice = (tradePrice: number) => {
    return tradePrice * 2;
  };

  useEffect(() => {
    const getFabricatorName = async () => {
      const { data, error } = await supabase
        .from("fabricators")
        .select("name")
        .eq("id", quote.fabricator_id)
        .single();
      
      if (error) {
        console.error("Error fetching fabricator:", error);
        return;
      }
      
      setFabricatorName(data.name);
    };

    getFabricatorName();
  }, [quote.fabricator_id]);

  const handleSelect = async () => {
    try {
      // First, unselect all quotes for this sculpture
      await supabase
        .from("fabrication_quotes")
        .update({ is_selected: false })
        .eq("sculpture_id", quote.sculpture_id);
      
      // Then select this quote
      const { error } = await supabase
        .from("fabrication_quotes")
        .update({ is_selected: true })
        .eq("id", quote.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Quote selected successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["fabrication-quotes", quote.sculpture_id] });
    } catch (error) {
      console.error("Error selecting quote:", error);
      toast({
        title: "Error",
        description: "Failed to select quote",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("fabrication_quotes")
        .delete()
        .eq("id", quote.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["fabrication-quotes", quote.sculpture_id] });
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 space-y-4 transition-colors ${
        quote.is_selected ? 'border-primary bg-primary/5' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">
            {fabricatorName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(quote.quote_date), "PPP")}
          </p>
        </div>
        <div className="flex gap-2">
          {!quote.is_selected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelect}
            >
              <CheckCircle2Icon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Fabrication</p>
            <p>${formatNumber(quote.fabrication_cost)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Shipping</p>
            <p>${formatNumber(quote.shipping_cost)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Customs</p>
            <p>${formatNumber(quote.customs_cost)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Other</p>
            <p>${formatNumber(quote.other_cost)}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Total Cost</p>
            <p>${formatNumber(calculateTotal(quote))}</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Markup</p>
            <p>{quote.markup}x</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Trade Price</p>
            <p>${formatNumber(calculateTradePrice(quote))}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Retail Price</p>
            <p>${formatNumber(calculateRetailPrice(calculateTradePrice(quote)))}</p>
          </div>
          <div className="col-span-2" />
        </div>
      </div>

      {quote.notes && (
        <div className="text-sm">
          <p className="font-medium text-muted-foreground">Notes</p>
          <p className="whitespace-pre-line">{quote.notes}</p>
        </div>
      )}

      {quote.is_selected && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle2Icon className="h-4 w-4" />
          <span>Selected Quote</span>
        </div>
      )}
    </div>
  );
}
