import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/roles";
import { toast } from "sonner";
import { PermissionAction, DEFAULT_ROLE_PERMISSIONS } from "@/types/permissions";

export function useUserRoles() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>('sales'); // Default to sales
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<PermissionAction[]>([]);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole('sales'); // Default role
      setIsAdmin(false);
      setPermissions(DEFAULT_ROLE_PERMISSIONS['sales']); // Default permissions
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is not found error, which is expected if user has no role
        console.error('Error fetching user role:', error);
        throw error;
      }
      
      const userRole = data?.role || 'sales'; // Default to sales if no role found
      console.log('Fetched user role:', userRole); // Debug log
      setRole(userRole);
      setIsAdmin(userRole === 'admin');
      
      // Set default permissions based on role
      setPermissions(DEFAULT_ROLE_PERMISSIONS[userRole]);
      
    } catch (error) {
      console.error('Error fetching user role:', error);
      // If there's an error, set a default role
      setRole('sales');
      setIsAdmin(false);
      setPermissions(DEFAULT_ROLE_PERMISSIONS['sales']);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const hasRole = (requiredRole: AppRole) => {
    return role === requiredRole;
  };

  const hasPermission = useCallback((requiredPermission: PermissionAction) => {
    return permissions.includes(requiredPermission);
  }, [permissions]);

  const assignRole = async (userId: string, newRole: AppRole) => {
    try {
      // First, delete any existing role for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      // Then insert the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (error) throw error;
      
      toast.success(`Role ${newRole} assigned successfully`);
      
      // If the current user's role is being updated, update the local state
      if (user && userId === user.id) {
        setRole(newRole);
        setIsAdmin(newRole === 'admin');
        setPermissions(DEFAULT_ROLE_PERMISSIONS[newRole]);
      }
      
      // Force refresh the role if the user being updated is the current user
      if (user && userId === user.id) {
        fetchRole();
      }
      
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(`Failed to assign role: ${error.message}`);
      return false;
    }
  };

  // The removeRole function is no longer needed since users always have a role
  // We'll keep it for backwards compatibility but make it a no-op that logs a warning
  const removeRole = async (userId: string) => {
    console.warn('Removing roles is no longer supported. All users must have a role.');
    return false;
  };

  return {
    role,
    loading,
    isAdmin,
    hasRole,
    hasPermission,
    assignRole,
    removeRole, // Kept for backwards compatibility
    permissions,
    fetchRole // Export the fetchRole function to allow manual refresh
  };
}
