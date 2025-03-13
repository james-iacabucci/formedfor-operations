
import { FabricationQuote } from "@/types/fabrication-quote";
import { QuotesList } from "./QuotesList";
import { Skeleton } from "@/components/ui/skeleton";

interface VariantQuotesSectionProps {
  selectedVariantId: string | null;
  quotes: FabricationQuote[];
  isLoadingQuotes: boolean;
  isQuotesError: boolean;
  fabricators: any[];
  handleSelectQuote: (quoteId: string) => void;
  handleStartEdit: (quote: FabricationQuote) => void;
  handleDeleteQuote: (quoteId: string) => void;
  calculateTotal: (quote: FabricationQuote) => number;
  calculateTradePrice: (quote: FabricationQuote) => number;
  calculateRetailPrice: (tradePrice: number) => number;
  formatNumber: (num: number) => string;
}

export function VariantQuotesSection({
  selectedVariantId,
  quotes,
  isLoadingQuotes,
  isQuotesError,
  fabricators,
  handleSelectQuote,
  handleStartEdit,
  handleDeleteQuote,
  calculateTotal,
  calculateTradePrice,
  calculateRetailPrice,
  formatNumber
}: VariantQuotesSectionProps) {
  if (!selectedVariantId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select a variant to view quotes.
      </div>
    );
  }

  return (
    <QuotesList
      quotes={quotes}
      isLoading={isLoadingQuotes}
      isError={isQuotesError}
      fabricators={fabricators}
      handleSelectQuote={handleSelectQuote}
      handleStartEdit={handleStartEdit}
      handleDeleteQuote={handleDeleteQuote}
      calculateTotal={calculateTotal}
      calculateTradePrice={calculateTradePrice}
      calculateRetailPrice={calculateRetailPrice}
      formatNumber={formatNumber}
    />
  );
}
