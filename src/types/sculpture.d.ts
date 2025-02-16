
export interface Sculpture {
  id: string;
  created_at: string;
  name: string;
  prompt: string;
  creativity_level: string | null;
  original_sculpture_id: string | null;
  dimensions: string | null;
  depth_in: number | null;
  width_in: number | null;
  height_in: number | null;
  weight_kg: number | null;
  weight_lbs: number | null;
  method_id: string | null;
  material_id: string | null;
  renderings: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  models: Array<{
    id: string;
    url: string;
    name: string;
  }>;
  status: string;
}
