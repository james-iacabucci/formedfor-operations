
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
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  const fetchRole = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log('No user logged in, setting default role and permissions');
      setRole('sales'); // Default role
      setIsAdmin(false);
      setPermissions(DEFAULT_ROLE_PERMISSIONS['sales']); // Default permissions
      setLoading(false);
      return;
    }

    // Only refresh if it's been more than 5 seconds since the last refresh or if force refresh is requested
    const currentTime = Date.now();
    if (!forceRefresh && (currentTime - lastRefreshTime) < 5000) {
      console.log('Skipping role refresh - recent refresh occurred');
      return;
    }

    try {
      console.log(`Fetching role for user ${user.id} (force: ${forceRefresh})`);
      setLoading(true);
      
      // Clear Supabase cache for this query by adding a timestamp
      const cacheInvalidator = `?cache_bust=${Date.now()}`;
      
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
      console.log(`User ${user.id} has role: ${userRole}`); // Debug log
      
      setRole(userRole);
      setIsAdmin(userRole === 'admin');
      
      // Set default permissions based on role
      setPermissions(DEFAULT_ROLE_PERMISSIONS[userRole]);
      setLastRefreshTime(currentTime);
      
    } catch (error) {
      console.error('Error fetching user role:', error);
      // If there's an error, set a default role
      setRole('sales');
      setIsAdmin(false);
      setPermissions(DEFAULT_ROLE_PERMISSIONS['sales']);
    } finally {
      setLoading(false);
    }
  }, [user, lastRefreshTime]);

  // Fetch roles on component mount and when user changes
  useEffect(() => {
    fetchRole(true);
  }, [fetchRole, user]);

  const hasRole = (requiredRole: AppRole) => {
    return role === requiredRole;
  };

  const hasPermission = useCallback((requiredPermission: PermissionAction) => {
    return permissions.includes(requiredPermission);
  }, [permissions]);

  const assignRole = async (userId: string, newRole: AppRole) => {
    try {
      console.log(`Attempting to assign role ${newRole} to user ${userId}`);
      
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
      
      console.log(`Successfully assigned role ${newRole} to user ${userId}`);
      toast.success(`Role ${newRole} assigned successfully`);
      
      // If the current user's role is being updated, update the local state
      if (user && userId === user.id) {
        setRole(newRole);
        setIsAdmin(newRole === 'admin');
        setPermissions(DEFAULT_ROLE_PERMISSIONS[newRole]);
      }
      
      // Force refresh the role if the user being updated is the current user
      if (user && userId === user.id) {
        fetchRole(true);
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
