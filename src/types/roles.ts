
export type AppRole = 'admin' | 'sales' | 'fabrication' | 'orders';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface UserWithRoles {
  id: string;
  username: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  created_at?: string;
  role: AppRole; // Always has a role, never null
}
