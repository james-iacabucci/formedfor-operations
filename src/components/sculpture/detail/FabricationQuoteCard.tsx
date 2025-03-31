
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
import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { useUserRoles } from "@/hooks/use-user-roles";

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
  const { hasPermission, role } = useUserRoles();

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

  // Determine if user can edit this quote based on role and status
  const canEditQuote = 
    // Admin/Sales can edit any quote (will be restricted in the form)
    ((role === 'admin' || role === 'sales') && 
      hasPermission('quote.edit')) || 
    // Fabrication can only edit requested quotes
    (role === 'fabrication' && 
      quote.status === 'requested' && 
      hasPermission('quote.edit_requested'));
  
  // Whether to display pricing details
  const canViewPricingDetails = hasPermission('quote.view_pricing') && role !== 'fabrication';
  
  // Hide pricing details if user doesn't have pricing view permission or is fabrication role
  const hidePricingDetails = !canViewPricingDetails;

  // Fabrication role cannot see action buttons for approved quotes
  const canSeeActionButtons = !(role === 'fabrication' && quote.status === 'approved');
  
  // Determine if this quote can be selected (only approved quotes)
  const canBeSelected = quote.status === 'approved' && !quote.is_selected;

  // Determine if the requote button should be visible
  // Only for APPROVED quotes and only for admin/sales with requote permission
  const showRequoteButton = 
    quote.status === 'approved' && 
    (role === 'admin' || role === 'sales') && 
    hasPermission('quote.requote') &&
    onRequote;

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
          
          {canSeeActionButtons && (
            <>
              {/* Select Quote - Admin/Sales can select approved quotes */}
              <PermissionGuard requiredPermission="quote.select">
                {(role === 'admin' || role === 'sales') && canBeSelected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSelect}
                    title="Select this quote"
                  >
                    <CheckCircle2Icon className="h-4 w-4" />
                  </Button>
                )}
              </PermissionGuard>
              
              {/* Approve Quote - Admin/Sales can approve submitted quotes */}
              <PermissionGuard requiredPermission="quote.approve">
                {(role === 'admin' || role === 'sales') && 
                  quote.status === 'submitted' && 
                  onApprove && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(quote.id)}
                    title="Approve quote"
                    className="text-green-600"
                  >
                    <ThumbsUpIcon className="h-4 w-4" />
                  </Button>
                )}
              </PermissionGuard>
              
              {/* Reject Quote - Admin/Sales can reject submitted quotes */}
              <PermissionGuard requiredPermission="quote.reject">
                {(role === 'admin' || role === 'sales') && 
                  quote.status === 'submitted' && 
                  onReject && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(quote.id)}
                    title="Reject quote"
                    className="text-destructive"
                  >
                    <ThumbsDownIcon className="h-4 w-4" />
                  </Button>
                )}
              </PermissionGuard>
              
              {/* Requote - Only show for approved quotes and users with permission */}
              {showRequoteButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequote(quote)}
                  title="Request requote"
                >
                  <RefreshCcwIcon className="h-4 w-4" />
                </Button>
              )}
              
              {/* Edit Quote - Only show if user has permission to edit */}
              {canEditQuote && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  title="Edit quote"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              )}
              
              {/* Submit for Approval - Fabrication can submit requested quotes */}
              {role === 'fabrication' && 
                quote.status === 'requested' && 
                hasPermission('quote.submit_approval') && 
                onSubmitForApproval && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSubmitForApproval(quote.id)}
                  title="Submit for approval"
                  className="gap-1"
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              )}
              
              {/* Delete Quote - Admin/Sales can delete quotes */}
              {(role === 'admin' || role === 'sales') && hasPermission('quote.delete') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  title="Delete quote"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </>
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
