
import { NewQuote } from "@/types/fabrication-quote-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PricingDetailsFormProps {
  newQuote: NewQuote;
  onQuoteChange: (quote: NewQuote) => void;
  calculateTotal: (quote: NewQuote) => number;
  calculateTradePrice: (quote: NewQuote) => number;
  calculateRetailPrice: (tradePrice: number) => number;
  formatNumber: (num: number) => string;
}

export function PricingDetailsForm({
  newQuote,
  onQuoteChange,
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber
}: PricingDetailsFormProps) {
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

  // Check if pricing details should be hidden
  const hidePricingDetails = newQuote.status === 'requested';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pricing Details</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fabrication_cost">Fabrication Cost ($)</Label>
          <Input
            id="fabrication_cost"
            type="number"
            value={newQuote.fabrication_cost ?? ''}
            onChange={(e) => handleChange('fabrication_cost', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="shipping_cost">Shipping Cost ($)</Label>
          <Input
            id="shipping_cost"
            type="number"
            value={newQuote.shipping_cost ?? ''}
            onChange={(e) => handleChange('shipping_cost', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customs_cost">Customs Cost ($)</Label>
          <Input
            id="customs_cost"
            type="number"
            value={newQuote.customs_cost ?? ''}
            onChange={(e) => handleChange('customs_cost', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="other_cost">Other Cost ($)</Label>
          <Input
            id="other_cost"
            type="number"
            value={newQuote.other_cost ?? ''}
            onChange={(e) => handleChange('other_cost', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Total Cost</Label>
          <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
            ${formatNumber(totalCost)}
          </div>
        </div>
        
        {!hidePricingDetails && (
          <>
            <div className="space-y-2">
              <Label htmlFor="markup">Markup Multiplier</Label>
              <Input
                id="markup"
                type="number"
                value={newQuote.markup}
                onChange={(e) => handleChange('markup', e.target.value)}
                placeholder="1"
                min="1"
                step="0.1"
              />
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
          </>
        )}
      </div>
    </div>
  );
}
