export type Sculpture = {
  id: string;
  prompt: string;
  image_url: string | null;
  created_at: string;
  creativity_level?: 'small' | 'medium' | 'large' | null;
  original_sculpture_id?: string | null;
};