
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { NewQuote } from "@/types/fabrication-quote-form";
import { Label } from "@/components/ui/label";

interface QuoteFormHeaderProps {
  newQuote: NewQuote;
  onQuoteChange: (quote: NewQuote) => void;
  fabricators: any[];
}

export function QuoteFormHeader({
  newQuote,
  onQuoteChange,
  fabricators
}: QuoteFormHeaderProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">Fabricator</Label>
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
        <Label className="text-sm font-medium text-muted-foreground">Quote Date</Label>
        <Input
          type="date"
          value={format(new Date(newQuote.quote_date), "yyyy-MM-dd")}
          onChange={(e) => onQuoteChange({ ...newQuote, quote_date: new Date(e.target.value).toISOString() })}
        />
      </div>
    </div>
  );
}
