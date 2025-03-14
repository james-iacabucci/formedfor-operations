
export type AppRole = 'admin' | 'sales' | 'fabrication' | 'orders';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface UserWithRoles extends Profile {
  roles: AppRole[];
}
