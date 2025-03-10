
import { Button } from "@/components/ui/button";
import { FabricationQuote } from "@/types/fabrication-quote";
import { format } from "date-fns";
import { PencilIcon, Trash2Icon, CheckCircle2Icon, ChevronUpIcon, ChevronDownIcon, MessageSquareIcon } from "lucide-react";
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@/components/ui/collapsible";

interface FabricationQuoteCardProps {
  quote: FabricationQuote;
  fabricatorName?: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChat: () => void;
  calculateTotal: (quote: FabricationQuote) => number;
  calculateTradePrice: (quote: FabricationQuote) => number;
  calculateRetailPrice: (tradePrice: number) => number;
  formatNumber: (num: number) => string;
  isEditing?: boolean;
}

export function FabricationQuoteCard({
  quote,
  fabricatorName,
  onSelect,
  onEdit,
  onDelete,
  onChat,
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber,
  isEditing
}: FabricationQuoteCardProps) {
  const [pricingDetailsOpen, setPricingDetailsOpen] = useState(true);

  return (
    <div 
      className={`border rounded-lg p-4 space-y-4 transition-colors ${
        quote.is_selected ? 'border-primary bg-primary/5' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">
            {fabricatorName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(quote.quote_date), "PPP")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onChat}
            title="Chat about this quote"
          >
            <MessageSquareIcon className="h-4 w-4" />
          </Button>
          {!quote.is_selected && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSelect}
              title="Select this quote"
            >
              <CheckCircle2Icon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            title="Edit quote"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
              title="Delete quote"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Pricing Details Section - Collapsible */}
      <Collapsible open={pricingDetailsOpen} onOpenChange={setPricingDetailsOpen}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Pricing Details</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
              {pricingDetailsOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-2">
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Fabrication</p>
              <p>${formatNumber(quote.fabrication_cost)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Shipping</p>
              <p>${formatNumber(quote.shipping_cost)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Customs</p>
              <p>${formatNumber(quote.customs_cost)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Other</p>
              <p>${formatNumber(quote.other_cost)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Total Cost</p>
              <p>${formatNumber(calculateTotal(quote))}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 text-sm mt-4">
            <div>
              <p className="font-medium text-muted-foreground">Markup</p>
              <p>{quote.markup}x</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Trade Price</p>
              <p>${formatNumber(calculateTradePrice(quote))}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Retail Price</p>
              <p>${formatNumber(calculateRetailPrice(calculateTradePrice(quote)))}</p>
            </div>
            <div className="col-span-2" />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {quote.notes && (
        <div className="text-sm pt-2">
          <p className="font-medium text-muted-foreground">Notes</p>
          <p className="whitespace-pre-line">{quote.notes}</p>
        </div>
      )}

      {quote.is_selected && (
        <div className="flex items-center gap-2 text-sm text-primary pt-2">
          <CheckCircle2Icon className="h-4 w-4" />
          <span>Selected Quote</span>
        </div>
      )}
    </div>
  );
}
