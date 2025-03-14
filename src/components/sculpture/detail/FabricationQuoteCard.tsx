import { Button } from "@/components/ui/button";
import { FabricationQuote } from "@/types/fabrication-quote";
import { format } from "date-fns";
import { PencilIcon, Trash2Icon, CheckCircle2Icon, RefreshCcwIcon, ThumbsUpIcon, ThumbsDownIcon, SendIcon } from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DeleteQuoteDialog } from "./components/DeleteQuoteDialog";

interface FabricationQuoteCardProps {
  quote: FabricationQuote;
  fabricatorName?: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSubmitForApproval?: (quoteId: string) => void;
  onApprove?: (quoteId: string) => void;
  onReject?: (quoteId: string) => void;
  onRequote?: (quote: FabricationQuote) => void;
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
  onSubmitForApproval,
  onApprove,
  onReject,
  onRequote,
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber,
  isEditing
}: FabricationQuoteCardProps) {
  const [pricingDetailsOpen, setPricingDetailsOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const displayValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return `$${formatNumber(value)}`;
  };

  const safeCalculate = (calculator: Function, ...args: any[]) => {
    try {
      const result = calculator(...args);
      return result === 0 ? "-" : `$${formatNumber(result)}`;
    } catch (error) {
      return "-";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'requested': return 'secondary';
      case 'submitted': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  const showDeleteButton = quote.status === 'requested' || quote.status === 'approved';
  
  const hidePricingDetails = quote.status === 'requested';

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
            {quote.updated_at 
              ? `Updated ${format(new Date(quote.updated_at), "PPP")}`
              : `Created ${format(new Date(quote.quote_date), "PPP")}`}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={getStatusBadgeVariant(quote.status)}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </Badge>
          
          {quote.status === 'approved' && !quote.is_selected && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSelect}
              title="Select this quote"
            >
              <CheckCircle2Icon className="h-4 w-4" />
            </Button>
          )}
          
          {quote.status === 'submitted' && onApprove && onReject && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApprove(quote.id)}
                title="Approve quote"
                className="text-green-600"
              >
                <ThumbsUpIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(quote.id)}
                title="Reject quote"
                className="text-destructive"
              >
                <ThumbsDownIcon className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {quote.status === 'approved' && onRequote && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRequote(quote)}
              title="Request requote"
            >
              <RefreshCcwIcon className="h-4 w-4" />
            </Button>
          )}
          
          {(quote.status === 'requested' || quote.status === 'rejected') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              title="Edit quote"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          
          {showDeleteButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              title="Delete quote"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
          
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              title="Delete quote"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <Collapsible open={pricingDetailsOpen} onOpenChange={setPricingDetailsOpen}>
        <CollapsibleContent className="pt-2">
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Fabrication</p>
              <p>{displayValue(quote.fabrication_cost)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Shipping</p>
              <p>{displayValue(quote.shipping_cost)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Customs</p>
              <p>{displayValue(quote.customs_cost)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Other</p>
              <p>{displayValue(quote.other_cost)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Total Cost</p>
              <p>{safeCalculate(calculateTotal, quote)}</p>
            </div>
          </div>

          {!hidePricingDetails && (
            <div className="grid grid-cols-5 gap-4 text-sm mt-4">
              <div>
                <p className="font-medium text-muted-foreground">Markup</p>
                <p>{quote.markup ? `${quote.markup}x` : "-"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Trade Price</p>
                <p>{safeCalculate(calculateTradePrice, quote)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Retail Price</p>
                <p>{safeCalculate(calculateRetailPrice, calculateTradePrice(quote))}</p>
              </div>
              <div className="col-span-2" />
            </div>
          )}
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

      <DeleteQuoteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
