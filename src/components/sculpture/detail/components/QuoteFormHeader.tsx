
import { useState, useEffect } from "react";
import { NewQuote } from "@/types/fabrication-quote-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface QuoteFormHeaderProps {
  newQuote: NewQuote;
  onQuoteChange: (quote: NewQuote) => void;
  fabricators: any[];
  isReadOnly?: boolean;
}

export function QuoteFormHeader({ 
  newQuote, 
  onQuoteChange, 
  fabricators, 
  isReadOnly = false 
}: QuoteFormHeaderProps) {
  const [date, setDate] = useState<Date>(new Date(newQuote.quote_date));

  useEffect(() => {
    if (newQuote.quote_date) {
      setDate(new Date(newQuote.quote_date));
    }
  }, [newQuote.quote_date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onQuoteChange({
        ...newQuote,
        quote_date: selectedDate.toISOString()
      });
    }
  };

  const handleFabricatorChange = (fabricatorId: string) => {
    onQuoteChange({
      ...newQuote,
      fabricator_id: fabricatorId
    });
  };

  const fabricatorName = fabricators?.find(f => f.id === newQuote.fabricator_id)?.name || "Select a fabricator";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="fabricator">Fabricator</Label>
        {isReadOnly ? (
          <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
            {fabricatorName}
          </div>
        ) : (
          <Select
            value={newQuote.fabricator_id}
            onValueChange={handleFabricatorChange}
          >
            <SelectTrigger id="fabricator">
              <SelectValue placeholder="Select a fabricator" />
            </SelectTrigger>
            <SelectContent>
              {fabricators?.map((fabricator) => (
                <SelectItem key={fabricator.id} value={fabricator.id}>
                  {fabricator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="quote_date">Date</Label>
        {isReadOnly ? (
          <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-muted-foreground">
            {format(date, "MMMM d, yyyy")}
          </div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="quote_date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
