
export function calculateTotal(quote: { 
  fabrication_cost: number | null; 
  shipping_cost: number | null; 
  customs_cost: number | null; 
  other_cost: number | null; 
}) {
  // Safely handle null values by defaulting to 0
  return (
    Number(quote.fabrication_cost || 0) +
    Number(quote.shipping_cost || 0) +
    Number(quote.customs_cost || 0) +
    Number(quote.other_cost || 0)
  );
}

export function calculateTradePrice(quote: { 
  markup: number;
  fabrication_cost: number | null;
  shipping_cost: number | null;
  customs_cost: number | null;
  other_cost: number | null;
}) {
  return calculateTotal(quote) * (quote.markup || 4);
}

export function calculateRetailPrice(tradePrice: number) {
  return Math.ceil(tradePrice / (1 - 0.35) / 250) * 250;
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(num);
}
