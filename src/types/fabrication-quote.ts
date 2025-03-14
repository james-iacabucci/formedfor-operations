
export interface FabricationQuote {
  id: string;
  sculpture_id: string;
  fabricator_id: string;
  fabrication_cost: number;
  shipping_cost: number;
  customs_cost: number;
  other_cost: number;
  markup: number;
  notes: string | null;
  quote_date: string; // Original quote date
  updated_at?: string; // Last update date
  is_selected: boolean;
  status: 'requested' | 'submitted' | 'approved' | 'rejected';
  
  // Physical attributes
  material_id: string | null;
  method_id: string | null;
  height_in: number | null;
  width_in: number | null;
  depth_in: number | null;
  weight_kg: number | null;
  weight_lbs: number | null;
  
  // Base attributes
  base_material_id: string | null;
  base_method_id: string | null;
  base_height_in: number | null;
  base_width_in: number | null;
  base_depth_in: number | null;
  base_weight_kg: number | null;
  base_weight_lbs: number | null;
  
  // New field for variant association
  variant_id: string | null;
}
