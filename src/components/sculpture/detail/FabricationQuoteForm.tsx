
import { NewQuote } from "@/types/fabrication-quote-form";
import { QuoteFormHeader } from "./components/QuoteFormHeader";
import { SculptureDetailsSection } from "./components/SculptureDetailsSection";
import { PricingDetailsForm } from "./components/PricingDetailsForm";
import { NotesSection } from "./components/NotesSection";
import { QuoteFormActions } from "./components/QuoteFormActions";

interface FabricationQuoteFormProps {
  newQuote: NewQuote;
  onQuoteChange: (quote: NewQuote) => void;
  onSave?: () => void;
  onCancel?: () => void;
  fabricators: any[];
  editingQuoteId: string | null;
  calculateTotal: (quote: NewQuote) => number;
  calculateTradePrice: (quote: NewQuote) => number;
  calculateRetailPrice: (tradePrice: number) => number;
  formatNumber: (num: number) => string;
  isInSheet?: boolean;
  isVariantMode?: boolean;
  isReadOnly?: boolean;
  canOnlyEditMarkup?: boolean;
}

export function FabricationQuoteForm({
  newQuote,
  onQuoteChange,
  onSave,
  onCancel,
  fabricators,
  editingQuoteId,
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber,
  isInSheet = false,
  isVariantMode = false,
  isReadOnly = false,
  canOnlyEditMarkup = false
}: FabricationQuoteFormProps) {
  const handleNotesChange = (newNotes: string) => {
    onQuoteChange({ ...newQuote, notes: newNotes });
  };

  return (
    <div className={`space-y-6 ${isInSheet ? "" : "border rounded-lg p-4"}`}>
      {/* Quote Header (Fabricator and Date) */}
      <QuoteFormHeader 
        newQuote={newQuote}
        onQuoteChange={onQuoteChange}
        fabricators={fabricators}
        isReadOnly={isReadOnly || canOnlyEditMarkup}
      />

      {/* Sculpture and Base Details are now read-only in variant mode */}
      {!isVariantMode && (
        <>
          {/* Sculpture Details Section */}
          <SculptureDetailsSection
            sculptureId={newQuote.sculpture_id}
            newQuote={newQuote}
            onQuoteChange={onQuoteChange}
            isReadOnly={isReadOnly || canOnlyEditMarkup}
          />

          {/* Base Details Section */}
          <SculptureDetailsSection
            sculptureId={newQuote.sculpture_id}
            newQuote={newQuote}
            onQuoteChange={onQuoteChange}
            isBase={true}
            isReadOnly={isReadOnly || canOnlyEditMarkup}
          />
        </>
      )}

      {/* Pricing Details Section */}
      <PricingDetailsForm
        newQuote={newQuote}
        onQuoteChange={onQuoteChange}
        calculateTotal={calculateTotal}
        calculateTradePrice={calculateTradePrice}
        calculateRetailPrice={calculateRetailPrice}
        formatNumber={formatNumber}
        isReadOnly={isReadOnly}
        canOnlyEditMarkup={canOnlyEditMarkup}
      />

      <NotesSection 
        notes={newQuote.notes} 
        onChange={handleNotesChange}
        isReadOnly={isReadOnly || canOnlyEditMarkup}
      />

      {/* Only show buttons if not in sheet mode */}
      {!isInSheet && (
        <QuoteFormActions
          onSave={onSave}
          onCancel={onCancel}
          isEditing={!!editingQuoteId}
          isReadOnly={isReadOnly && !canOnlyEditMarkup}
          canOnlyEditMarkup={canOnlyEditMarkup}
        />
      )}
    </div>
  );
}
