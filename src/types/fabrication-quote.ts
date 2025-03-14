
export interface FabricationQuote {
  id: string;
  sculpture_id: string;
  fabricator_id: string;
  fabrication_cost: number;
  shipping_cost: number;
  customs_cost: number;
  other_cost: number;
  markup: number;
  quote_date: string;
  notes: string | null;
  created_at: string;
  is_selected: boolean;
  status: 'requested' | 'submitted' | 'approved' | 'rejected';
  
  // Sculpture Details (moved from sculpture)
  material_id: string | null;
  method_id: string | null;
  height_in: number | null;
  width_in: number | null;
  depth_in: number | null;
  height_cm: number | null;
  width_cm: number | null;
  depth_cm: number | null;
  weight_kg: number | null;
  weight_lbs: number | null;
  
  // Base Details (moved from sculpture)
  base_material_id: string | null;
  base_method_id: string | null;
  base_height_in: number | null;
  base_width_in: number | null;
  base_depth_in: number | null;
  base_height_cm: number | null;
  base_width_cm: number | null;
  base_depth_cm: number | null;
  base_weight_kg: number | null;
  base_weight_lbs: number | null;
  
  // Variant association
  variant_id: string | null;
}
