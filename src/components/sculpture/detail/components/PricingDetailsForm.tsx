
import { Input } from "@/components/ui/input";
import { NewQuote } from "@/types/fabrication-quote-form";

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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof NewQuote
  ) => {
    const value = e.target.value;
    const numValue = value ? parseFloat(value) : 0;
    onQuoteChange({ ...newQuote, [field]: numValue });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pricing Details</h3>
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
  );
}
