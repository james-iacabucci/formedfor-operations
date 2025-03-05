
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
  
  // Sculpture Details
  material_id?: string | null;
  method_id?: string | null;
  height_in?: number | null;
  width_in?: number | null;
  depth_in?: number | null;
  weight_kg?: number | null;
  weight_lbs?: number | null;
  
  // Base Details
  base_material_id?: string | null;
  base_method_id?: string | null;
  base_height_in?: number | null;
  base_width_in?: number | null;
  base_depth_in?: number | null;
  base_weight_kg?: number | null;
  base_weight_lbs?: number | null;
}
