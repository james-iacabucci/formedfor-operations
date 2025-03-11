
import { useState, useEffect } from "react";
import { NewQuote } from "@/types/fabrication-quote-form";
import { FabricationQuote } from "@/types/fabrication-quote";
import { FabricationQuoteForm } from "./FabricationQuoteForm";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber
} from "@/utils/fabrication-quote-calculations";

interface EditFabricationQuoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId: string;
  editingQuoteId: string | null;
  fabricators: any[];
  onQuoteSaved: () => Promise<void>;
  initialQuote?: NewQuote;
}

export function EditFabricationQuoteSheet({
  open,
  onOpenChange,
  sculptureId,
  editingQuoteId,
  fabricators,
  onQuoteSaved,
  initialQuote
}: EditFabricationQuoteSheetProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newQuote, setNewQuote] = useState<NewQuote>({
    sculpture_id: sculptureId,
    fabricator_id: undefined, // Initialize with undefined
    fabrication_cost: 500,
    shipping_cost: 0,
    customs_cost: 0,
    other_cost: 0,
    markup: 4,
    notes: "",
    quote_date: new Date().toISOString(),
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

  // When the sheet opens, initialize with the provided quote data if editing
  useEffect(() => {
    if (open && initialQuote) {
      setNewQuote(initialQuote);
    } else if (open && !initialQuote) {
      // Reset to default values when adding a new quote
      setNewQuote({
        sculpture_id: sculptureId,
        fabricator_id: undefined, // Initialize with undefined
        fabrication_cost: 500,
        shipping_cost: 0,
        customs_cost: 0,
        other_cost: 0,
        markup: 4,
        notes: "",
        quote_date: new Date().toISOString(),
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
    }
  }, [open, initialQuote, sculptureId]);

  const handleQuoteChange = (quote: NewQuote) => {
    setNewQuote(quote);
  };

  const handleSave = async () => {
    if (!newQuote.fabricator_id) {
      toast({
        title: "Error",
        description: "Please select a fabricator",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingQuoteId) {
        // Update existing quote
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
            // Include all physical attributes from the variant
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
          throw error;
        }

        toast({
          title: "Success",
          description: "Quote updated successfully",
        });
      } else {
        // Add new quote
        const quoteToInsert = {
          ...newQuote,
          fabricator_id: newQuote.fabricator_id,
          sculpture_id: sculptureId,
        };

        const { error } = await supabase
          .from("fabrication_quotes")
          .insert(quoteToInsert);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Quote added successfully",
        });
      }

      // Refresh quotes and close sheet
      await onQuoteSaved();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving quote:", error);
      toast({
        title: "Error",
        description: "Failed to save quote: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingQuoteId ? "Edit Quote" : "Add New Quote"}</SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          <FabricationQuoteForm
            newQuote={newQuote}
            onQuoteChange={handleQuoteChange}
            fabricators={fabricators}
            editingQuoteId={editingQuoteId}
            calculateTotal={calculateTotal}
            calculateTradePrice={calculateTradePrice}
            calculateRetailPrice={calculateRetailPrice}
            formatNumber={formatNumber}
            isInSheet={true}
            isVariantMode={true}
          />
        </div>
        
        <SheetFooter className="pt-4 border-t">
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Apply"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
