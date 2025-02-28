
export interface NewQuote {
  fabricator_id: string;
  quote_date: string;
  fabrication_cost: number;
  shipping_cost: number;
  customs_cost: number;
  other_cost: number;
  markup: number;
  notes: string | null;
  sculpture_id: string;
}
