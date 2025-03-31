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
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { useUserRoles } from "@/hooks/use-user-roles";

interface EditFabricationQuoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId: string;
  editingQuoteId: string | null;
  fabricators: any[];
  onQuoteSaved: () => Promise<void>;
  initialQuote?: NewQuote;
  onSubmitForApproval?: (quoteId: string) => Promise<void>;
}

export function EditFabricationQuoteSheet({
  open,
  onOpenChange,
  sculptureId,
  editingQuoteId,
  fabricators,
  onQuoteSaved,
  initialQuote,
  onSubmitForApproval
}: EditFabricationQuoteSheetProps) {
  const { saveQuote, isSaving } = useQuoteSave();
  const [newQuote, setNewQuote] = useState<NewQuote>(createDefaultQuote(sculptureId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission, role } = useUserRoles();

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
    // For admin/sales in restricted editing mode, only allow markup and notes changes
    if (canOnlyEditMarkup && editingQuoteId) {
      const updatedQuote = {
        ...initialQuote,
        markup: newQuote.markup,
        notes: newQuote.notes
      } as NewQuote;
      
      const success = await saveQuote(updatedQuote, editingQuoteId, onQuoteSaved);
      if (success) {
        onOpenChange(false);
      }
      return;
    }
    
    const success = await saveQuote(newQuote, editingQuoteId, onQuoteSaved);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!editingQuoteId) return;
    
    setIsSubmitting(true);
    try {
      // Save the quote with updated status
      const success = await saveQuote(
        { ...newQuote, status: "submitted" },
        editingQuoteId, 
        onQuoteSaved
      );
      
      if (success && onSubmitForApproval) {
        // Call the provided callback to update the status in the parent component
        await onSubmitForApproval(editingQuoteId);
      }
      
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if we should show the Submit for Approval button
  // Only show for requested quotes, and only for fabrication role with submit_approval permission
  const showSubmitForApproval = 
    !!editingQuoteId && 
    newQuote.status === 'requested' && 
    role === 'fabrication' &&
    hasPermission('quote.submit_approval') && 
    !!onSubmitForApproval;

  // Determine if the form is editable based on role and quote status
  const canEdit = 
    // Admin and Sales can edit non-approved quotes
    ((role === 'admin' || role === 'sales') && 
     hasPermission('quote.edit') && 
     newQuote.status !== 'approved') ||
    // Fabrication can only edit requested quotes 
    (role === 'fabrication' && 
     hasPermission('quote.edit_requested') && 
     newQuote.status === 'requested');

  // For Admin/Sales, determine if they can only edit the markup and notes (submitted or approved status)
  const canOnlyEditMarkup = 
    (role === 'admin' || role === 'sales') && 
    hasPermission('quote.edit') &&
    (newQuote.status === 'submitted' || newQuote.status === 'approved');

  console.log("Quote status:", newQuote.status);
  console.log("Can edit:", canEdit);
  console.log("Can only edit markup:", canOnlyEditMarkup);
  console.log("Should show Submit for Approval button:", showSubmitForApproval);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingQuoteId ? "Fabrication Quote" : "Add New Quote"}
          </SheetTitle>
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
            isReadOnly={!canEdit && !canOnlyEditMarkup}
            canOnlyEditMarkup={canOnlyEditMarkup}
          />
        </div>
        
        <SheetFooter className="pt-4 border-t">
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isSubmitting}
            >
              Cancel
            </Button>
            
            {(canEdit || canOnlyEditMarkup) && (
              <Button 
                onClick={handleSave}
                disabled={isSaving || isSubmitting}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
            
            {showSubmitForApproval && (
              <Button 
                onClick={handleSubmitForApproval}
                disabled={isSaving || isSubmitting}
                className="gap-1"
              >
                <SendIcon className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Quote"}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function createDefaultQuote(sculptureId: string): NewQuote {
  return {
    sculpture_id: sculptureId,
    fabricator_id: undefined,
    fabrication_cost: null,
    shipping_cost: null,
    customs_cost: null,
    other_cost: null,
    markup: 4,
    notes: "",
    quote_date: new Date().toISOString(),
    status: "requested",
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

// Helper functions to calculate quote values
function calculateTotal(quote: any) {
  return (
    Number(quote.fabrication_cost || 0) +
    Number(quote.shipping_cost || 0) +
    Number(quote.customs_cost || 0) +
    Number(quote.other_cost || 0)
  );
}

function calculateTradePrice(quote: any) {
  return calculateTotal(quote) * (quote.markup || 1);
}

function calculateRetailPrice(tradePrice: number) {
  return tradePrice * 2;
}

function formatNumber(num: number) {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
