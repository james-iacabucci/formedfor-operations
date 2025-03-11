
import { useState, useEffect } from "react";
import { NewQuote } from "@/types/fabrication-quote-form";
import { FabricationQuoteForm } from "./FabricationQuoteForm";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { useQuoteSave } from "./hooks/quotes/useQuoteSave";
import { SheetFooterActions } from "./components/SheetFooterActions";
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
  const { saveQuote, isSaving } = useQuoteSave();
  const [newQuote, setNewQuote] = useState<NewQuote>(createDefaultQuote(sculptureId));

  // When the sheet opens, initialize with the provided quote data if editing
  useEffect(() => {
    if (open && initialQuote) {
      console.log("Initializing quote form with:", initialQuote);
      setNewQuote(initialQuote);
    } else if (open && !initialQuote) {
      // Reset to default values when adding a new quote
      console.log("Resetting quote form to defaults");
      setNewQuote(createDefaultQuote(sculptureId));
    }
  }, [open, initialQuote, sculptureId]);

  const handleQuoteChange = (quote: NewQuote) => {
    setNewQuote(quote);
  };

  const handleSave = async () => {
    const success = await saveQuote(newQuote, editingQuoteId, onQuoteSaved);
    if (success) {
      onOpenChange(false);
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
          <SheetFooterActions 
            onCancel={() => onOpenChange(false)}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function createDefaultQuote(sculptureId: string): NewQuote {
  return {
    sculpture_id: sculptureId,
    fabricator_id: undefined,
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
    variant_id: null
  };
}
