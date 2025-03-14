
import { useMemo } from "react";
import { FabricationQuote } from "@/types/fabrication-quote";
import { FabricationQuoteCard } from "../FabricationQuoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRoles } from "@/hooks/use-user-roles";

interface QuotesListProps {
  quotes: FabricationQuote[];
  isLoading: boolean;
  isError: boolean;
  fabricators: any[];
  handleSelectQuote: (quoteId: string) => void;
  handleStartEdit: (quote: FabricationQuote) => void;
  handleDeleteQuote: (quoteId: string) => void;
  handleSubmitForApproval?: (quoteId: string) => void;
  handleApproveQuote?: (quoteId: string) => void;
  handleRejectQuote?: (quoteId: string) => void;
  handleRequoteQuote?: (quote: FabricationQuote) => void;
  calculateTotal: (quote: FabricationQuote) => number;
  calculateTradePrice: (quote: FabricationQuote) => number;
  calculateRetailPrice: (tradePrice: number) => number;
  formatNumber: (num: number) => string;
}

export function QuotesList({
  quotes,
  isLoading,
  isError,
  fabricators,
  handleSelectQuote,
  handleStartEdit,
  handleDeleteQuote,
  handleSubmitForApproval,
  handleApproveQuote,
  handleRejectQuote,
  handleRequoteQuote,
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber
}: QuotesListProps) {
  const { hasPermission } = useUserRoles();
  
  // Memoize sorting operation to avoid unnecessary re-renders
  const sortedQuotes = useMemo(() => {
    if (!quotes) return [];
    
    return [...quotes].sort((a, b) => {
      if (a.is_selected) return -1;
      if (b.is_selected) return 1;
      
      // Then sort by status priority
      const statusPriority: Record<string, number> = {
        'submitted': 1,
        'requested': 2,
        'approved': 3,
        'rejected': 4
      };
      
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      
      // Then by date (newest first)
      return new Date(b.quote_date).getTime() - new Date(a.quote_date).getTime();
    });
  }, [quotes]);

  // Function to determine if a user can edit a specific quote
  const canEditQuote = (quote: FabricationQuote) => {
    return hasPermission('quote.edit') || 
      (hasPermission('quote.edit_requested') && quote.status === 'requested');
  };

  // Loading state - with improved skeleton UI
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
            <div className="pt-3">
              <Skeleton className="h-4 w-full mb-3" />
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state - only shown when not loading and no quotes
  if (!isLoading && quotes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No quotes available for this variant. Click "Request Quote" to create one.
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading quotes. Please try again.
      </div>
    );
  }

  // Quotes list - only shown when not loading and has quotes
  return (
    <div className="space-y-6">
      {sortedQuotes.map((quote) => (
        <FabricationQuoteCard
          key={quote.id}
          quote={quote}
          fabricatorName={fabricators?.find((f) => f.id === quote.fabricator_id)?.name}
          onSelect={() => handleSelectQuote(quote.id)}
          onEdit={() => handleStartEdit(quote)}
          onDelete={() => handleDeleteQuote(quote.id)}
          onSubmitForApproval={handleSubmitForApproval}
          onApprove={handleApproveQuote}
          onReject={handleRejectQuote}
          onRequote={handleRequoteQuote}
          calculateTotal={calculateTotal}
          calculateTradePrice={calculateTradePrice}
          calculateRetailPrice={calculateRetailPrice}
          formatNumber={formatNumber}
          isEditing={false}
        />
      ))}
    </div>
  );
}
