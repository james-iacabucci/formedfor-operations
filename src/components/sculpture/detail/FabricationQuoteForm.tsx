
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NewQuote } from "@/types/fabrication-quote-form";
import { SculptureMaterialFinish } from "./SculptureMaterialFinish";
import { SculptureMethod } from "./SculptureMethod";
import { SculptureDimensions } from "./SculptureDimensions";
import { SculptureWeight } from "./SculptureWeight";
import { QuoteFormHeader } from "./components/QuoteFormHeader";
import { PricingDetailsForm } from "./components/PricingDetailsForm";

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
  isVariantMode = false
}: FabricationQuoteFormProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof NewQuote
  ) => {
    const value = e.target.value;
    if (field === 'notes') {
      onQuoteChange({ ...newQuote, [field]: value });
    } else {
      const numValue = value ? parseFloat(value) : 0;
      onQuoteChange({ ...newQuote, [field]: numValue });
    }
  };

  const handleDimensionsChange = (field: string, value: number | null) => {
    onQuoteChange({ ...newQuote, [field]: value });
  };

  return (
    <div className={`space-y-6 ${isInSheet ? "" : "border rounded-lg p-4"}`}>
      {/* Quote Header (Fabricator and Date) */}
      <QuoteFormHeader 
        newQuote={newQuote}
        onQuoteChange={onQuoteChange}
        fabricators={fabricators}
      />

      {/* Sculpture and Base Details are now read-only in variant mode */}
      {!isVariantMode && (
        <>
          {/* Sculpture Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sculpture Details</h3>
            <div className="space-y-4">
              <SculptureMaterialFinish
                sculptureId={newQuote.sculpture_id}
                materialId={newQuote.material_id}
                onMaterialChange={(materialId) => onQuoteChange({ ...newQuote, material_id: materialId })}
                isQuoteForm={true}
              />
              
              <SculptureMethod
                sculptureId={newQuote.sculpture_id}
                methodId={newQuote.method_id}
                onMethodChange={(methodId) => onQuoteChange({ ...newQuote, method_id: methodId })}
                isQuoteForm={true}
              />
              
              <SculptureDimensions
                sculptureId={newQuote.sculpture_id}
                height={newQuote.height_in}
                width={newQuote.width_in}
                depth={newQuote.depth_in}
                onDimensionsChange={(field, value) => handleDimensionsChange(field, value)}
                isQuoteForm={true}
              />
              
              <SculptureWeight
                sculptureId={newQuote.sculpture_id}
                weightKg={newQuote.weight_kg}
                weightLbs={newQuote.weight_lbs}
                onWeightChange={(field, value) => handleDimensionsChange(field, value)}
                isQuoteForm={true}
              />
            </div>
          </div>

          {/* Base Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Base Details</h3>
            <div className="space-y-4">
              <SculptureMaterialFinish
                sculptureId={newQuote.sculpture_id}
                materialId={newQuote.base_material_id}
                onMaterialChange={(materialId) => onQuoteChange({ ...newQuote, base_material_id: materialId })}
                isBase={true}
                isQuoteForm={true}
              />
              
              <SculptureMethod
                sculptureId={newQuote.sculpture_id}
                methodId={newQuote.base_method_id}
                onMethodChange={(methodId) => onQuoteChange({ ...newQuote, base_method_id: methodId })}
                isBase={true}
                isQuoteForm={true}
              />
              
              <SculptureDimensions
                sculptureId={newQuote.sculpture_id}
                height={newQuote.base_height_in}
                width={newQuote.base_width_in}
                depth={newQuote.base_depth_in}
                onDimensionsChange={(field, value) => handleDimensionsChange(field, value)}
                isBase={true}
                isQuoteForm={true}
              />
              
              <SculptureWeight
                sculptureId={newQuote.sculpture_id}
                weightKg={newQuote.base_weight_kg}
                weightLbs={newQuote.base_weight_lbs}
                onWeightChange={(field, value) => handleDimensionsChange(field, value)}
                isBase={true}
                isQuoteForm={true}
              />
            </div>
          </div>
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
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Notes</label>
        <Textarea
          value={newQuote.notes || ""}
          onChange={(e) => handleInputChange(e, 'notes')}
          rows={5}
        />
      </div>

      {/* Only show buttons if not in sheet mode */}
      {!isInSheet && onSave && onCancel && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editingQuoteId ? "Save Changes" : "Save Quote"}
          </Button>
        </div>
      )}
    </div>
  );
}
