
export function calculateTotal(quote: { 
  fabrication_cost: number; 
  shipping_cost: number; 
  customs_cost: number; 
  other_cost: number; 
}) {
  return (
    (quote.fabrication_cost || 0) +
    (quote.shipping_cost || 0) +
    (quote.customs_cost || 0) +
    (quote.other_cost || 0)
  );
}

export function calculateTradePrice(quote: { 
  markup: number;
  fabrication_cost: number;
  shipping_cost: number;
  customs_cost: number;
  other_cost: number;
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
