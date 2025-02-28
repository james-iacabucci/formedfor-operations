
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NewQuote } from "@/types/fabrication-quote-form";

interface FabricationQuoteFormProps {
  newQuote: NewQuote;
  onQuoteChange: (quote: NewQuote) => void;
  onSave: () => void;
  onCancel: () => void;
  fabricators: any[];
  editingQuoteId: string | null;
  calculateTotal: (quote: NewQuote) => number;
  calculateTradePrice: (quote: NewQuote) => number;
  calculateRetailPrice: (tradePrice: number) => number;
  formatNumber: (num: number) => string;
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
  formatNumber
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

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Fabricator</label>
          <Select
            value={newQuote.fabricator_id}
            onValueChange={(value) => onQuoteChange({ ...newQuote, fabricator_id: value })}
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
            onChange={(e) => onQuoteChange({ ...newQuote, quote_date: new Date(e.target.value).toISOString() })}
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
        <Button onClick={onSave}>
          {editingQuoteId ? "Save Changes" : "Save Quote"}
        </Button>
      </div>
    </div>
  );
}
