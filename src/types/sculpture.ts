export type Sculpture = {
  id: string;
  prompt: string;
  image_url: string | null;
  created_at: string;
  creativity_level: "none" | "small" | "medium" | "large" | null;
  original_sculpture_id?: string | null;
  ai_generated_name?: string | null;
  ai_description?: string | null;
  user_id: string;
};