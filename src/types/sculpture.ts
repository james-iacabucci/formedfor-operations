
export type FileUpload = {
  id: string;
  name: string;
  url: string;
  created_at: string;
};

export type Sculpture = {
  id: string;
  prompt: string;
  image_url: string | null;
  created_at: string;
  creativity_level: "none" | "low" | "medium" | "high" | null;
  original_sculpture_id?: string | null;
  ai_generated_name?: string | null;
  ai_description?: string | null;
  user_id: string;
  ai_engine: "runware" | "manual";
  status: "idea" | "pending" | "approved" | "archived";
  models: FileUpload[];
  renderings: FileUpload[];
  dimensions: FileUpload[];
  height_in: number | null;
  width_in: number | null;
  depth_in: number | null;
  height_cm: number | null;
  width_cm: number | null;
  depth_cm: number | null;
  weight_kg: number | null;
  weight_lbs: number | null;
  method_id: string | null;
  material_id: string | null;
  product_line_id: string | null;
  // Add base-related properties
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
};
