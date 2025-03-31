
import { NewQuote } from "@/types/fabrication-quote-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserRoles } from "@/hooks/use-user-roles";

interface PricingDetailsFormProps {
  newQuote: NewQuote;
  onQuoteChange: (quote: NewQuote) => void;
  calculateTotal: (quote: NewQuote) => number;
  calculateTradePrice: (quote: NewQuote) => number;
  calculateRetailPrice: (tradePrice: number) => number;
  formatNumber: (num: number) => string;
  isReadOnly?: boolean;
  canOnlyEditMarkup?: boolean;
}

export function PricingDetailsForm({
  newQuote,
  onQuoteChange,
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber,
  isReadOnly = false,
  canOnlyEditMarkup = false
}: PricingDetailsFormProps) {
  const { hasPermission, role } = useUserRoles();
  
  const handleChange = (field: keyof NewQuote, value: any) => {
    onQuoteChange({
      ...newQuote,
      [field]: value === "" ? null : Number(value)
    });
  };

  // Calculate values
  const totalCost = calculateTotal(newQuote);
  const tradePrice = calculateTradePrice(newQuote);
  const retailPrice = calculateRetailPrice(tradePrice);

  // Hide pricing details if user doesn't have view_pricing permission
  const hidePricingDetails = !hasPermission('quote.view_pricing') || role === 'fabrication';

  // Determine if each field should be readonly
  const isBaseCostReadOnly = isReadOnly || canOnlyEditMarkup;
  const isMarkupReadOnly = isReadOnly;

  // Calculate kg from lbs
  const handleLbsChange = (field: string, lbsValue: string) => {
    const lbs = lbsValue === "" ? null : Number(lbsValue);
    const kg = lbs !== null ? Number((lbs / 2.20462).toFixed(2)) : null;
    
    // Update both kg and lbs
    if (field === 'weight_lbs') {
      onQuoteChange({
        ...newQuote,
        weight_lbs: lbs,
        weight_kg: kg
      });
    } else if (field === 'base_weight_lbs') {
      onQuoteChange({
        ...newQuote,
        base_weight_lbs: lbs,
        base_weight_kg: kg
      });
    }
  };

  // Calculate lbs from kg
  const handleKgChange = (field: string, kgValue: string) => {
    const kg = kgValue === "" ? null : Number(kgValue);
    const lbs = kg !== null ? Number((kg * 2.20462).toFixed(2)) : null;
    
    // Update both kg and lbs
    if (field === 'weight_kg') {
      onQuoteChange({
        ...newQuote,
        weight_kg: kg,
        weight_lbs: lbs
      });
    } else if (field === 'base_weight_kg') {
      onQuoteChange({
        ...newQuote,
        base_weight_kg: kg,
        base_weight_lbs: lbs
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pricing Details</h3>
      
      {/* Cost fields - all on one line */}
      <div className="grid grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fabrication_cost">Fabrication</Label>
          {isBaseCostReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {newQuote.fabrication_cost !== null ? formatNumber(newQuote.fabrication_cost) : "0.00"}
            </div>
          ) : (
            <Input
              id="fabrication_cost"
              type="number"
              value={newQuote.fabrication_cost ?? ''}
              onChange={(e) => handleChange('fabrication_cost', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="shipping_cost">Shipping</Label>
          {isBaseCostReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {newQuote.shipping_cost !== null ? formatNumber(newQuote.shipping_cost) : "0.00"}
            </div>
          ) : (
            <Input
              id="shipping_cost"
              type="number"
              value={newQuote.shipping_cost ?? ''}
              onChange={(e) => handleChange('shipping_cost', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customs_cost">Customs</Label>
          {isBaseCostReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {newQuote.customs_cost !== null ? formatNumber(newQuote.customs_cost) : "0.00"}
            </div>
          ) : (
            <Input
              id="customs_cost"
              type="number"
              value={newQuote.customs_cost ?? ''}
              onChange={(e) => handleChange('customs_cost', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="other_cost">Other</Label>
          {isBaseCostReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {newQuote.other_cost !== null ? formatNumber(newQuote.other_cost) : "0.00"}
            </div>
          ) : (
            <Input
              id="other_cost"
              type="number"
              value={newQuote.other_cost ?? ''}
              onChange={(e) => handleChange('other_cost', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Total</Label>
          <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
            ${formatNumber(totalCost)}
          </div>
        </div>
      </div>
      
      {/* Markup and price fields - on second line */}
      {!hidePricingDetails && (
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="markup">Markup</Label>
            {isMarkupReadOnly ? (
              <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
                {newQuote.markup !== null ? formatNumber(newQuote.markup) : "1"}
              </div>
            ) : (
              <Input
                id="markup"
                type="number"
                value={newQuote.markup}
                onChange={(e) => handleChange('markup', e.target.value)}
                placeholder="1"
                min="1"
                step="0.1"
                className={canOnlyEditMarkup ? "border-primary ring-1 ring-primary" : ""}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Trade Price</Label>
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              ${formatNumber(tradePrice)}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Retail Price</Label>
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              ${formatNumber(retailPrice)}
            </div>
          </div>
        </div>
      )}

      {/* Weight Fields */}
      <h4 className="text-md font-medium mt-6">Sculpture Weight</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight_kg">Weight (kg)</Label>
          {isBaseCostReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {newQuote.weight_kg !== null ? formatNumber(newQuote.weight_kg) : "Not specified"}
            </div>
          ) : (
            <Input
              id="weight_kg"
              type="number"
              value={newQuote.weight_kg ?? ''}
              onChange={(e) => handleKgChange('weight_kg', e.target.value)}
              placeholder="Weight in kg"
              min="0"
              step="0.01"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weight_lbs">Weight (lbs)</Label>
          {isBaseCostReadOnly ? (
            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
              {newQuote.weight_lbs !== null ? formatNumber(newQuote.weight_lbs) : "Not specified"}
            </div>
          ) : (
            <Input
              id="weight_lbs"
              type="number"
              value={newQuote.weight_lbs ?? ''}
              onChange={(e) => handleLbsChange('weight_lbs', e.target.value)}
              placeholder="Weight in lbs"
              min="0"
              step="0.01"
            />
          )}
        </div>
      </div>
    </div>
  );
}
