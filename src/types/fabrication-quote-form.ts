
export interface NewQuote {
  sculpture_id: string;
  fabricator_id?: string;
  fabrication_cost: number;
  shipping_cost: number;
  customs_cost: number;
  other_cost: number;
  markup: number;
  quote_date: string;
  notes: string | null;
}
