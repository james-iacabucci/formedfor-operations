
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/roles";
import { toast } from "sonner";
import { PermissionAction, DEFAULT_ROLE_PERMISSIONS } from "@/types/permissions";

export function useUserRoles() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<PermissionAction[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const fetchInProgress = useRef(false);
  const roleCache = useRef<Record<string, { role: AppRole, timestamp: number }>>({});
  const roleAssignAttempted = useRef(false);

  const fetchRole = useCallback(async (forceRefresh = false) => {
    if (!user || fetchInProgress.current) {
      if (!user) {
        console.log('No user logged in, keeping current role state');
        if (loading) setLoading(false);
      }
      return;
    }

    const cachedData = roleCache.current[user.id];
    const currentTime = Date.now();
    const cacheAge = cachedData ? currentTime - cachedData.timestamp : Infinity;
    
    if (!forceRefresh && cachedData && cacheAge < 10000) {
      console.log(`Using cached role for user ${user.id}: ${cachedData.role}`);
      if (role !== cachedData.role) {
        setRole(cachedData.role);
        setIsAdmin(cachedData.role === 'admin');
        setPermissions(DEFAULT_ROLE_PERMISSIONS[cachedData.role]);
      }
      if (loading) setLoading(false);
      return;
    }

    if (!forceRefresh && (currentTime - lastRefreshTime) < 5000) {
      console.log('Skipping role refresh - recent refresh occurred');
      return;
    }

    try {
      fetchInProgress.current = true;
      console.log(`Fetching role for user ${user.id} (force: ${forceRefresh})`);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        if (error.code === 'PGRST116') {
          // No role found, check database directly to see what's going on
          console.log('No role found in user_roles table, checking if role exists');
          const { count, error: countError } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
            
          if (countError) {
            console.error('Error checking role count:', countError);
          } else {
            console.log(`Found ${count} roles for user ${user.id}`);
          }
        }
        if (error.code !== 'PGRST116') {
          throw error;
        }
      }
      
      const userRole = data?.role || null;
      console.log(`User ${user.id} has role: ${userRole}`);
      
      if (role !== userRole) {
        setRole(userRole);
        if (userRole) {
          setIsAdmin(userRole === 'admin');
          setPermissions(DEFAULT_ROLE_PERMISSIONS[userRole]);
        } else {
          setIsAdmin(false);
          setPermissions([]);
        }
      }

      if (userRole) {
        roleCache.current[user.id] = {
          role: userRole,
          timestamp: currentTime
        };
      }
      
      setLastRefreshTime(currentTime);
      
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        fetchInProgress.current = false;
      }, 300);
    }
  }, [user, lastRefreshTime, role, loading]);

  // Add a function to ensure user has a role
  const ensureUserHasRole = async () => {
    if (!user || role || roleAssignAttempted.current) return; // Skip if no user, already has role, or already attempted
    
    roleAssignAttempted.current = true; // Mark as attempted to prevent multiple attempts
    
    try {
      console.log(`Checking if user ${user.id} needs a default role assigned`);
      
      // Only proceed if we're sure the user has no role
      const { count, error: countError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (countError) {
        console.error('Error checking role count:', countError);
        return;
      }
      
      if (count === 0) {
        console.log(`No roles found for user ${user.id}, assigning default role`);
        await assignRole(user.id, 'fabrication');
        toast.success('Default role assigned');
        fetchRole(true);
      }
    } catch (error) {
      console.error('Error ensuring user has role:', error);
      if (error.code === '42501') {
        // This is a row-level security policy error, don't retry
        console.log('Row-level security prevented role assignment. This is a permissions issue.');
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchRole(!role);
      
      // If after initial fetch there's still no role, ensure a default one
      if (!role && !loading) {
        const timer = setTimeout(() => {
          if (!roleAssignAttempted.current) {
            ensureUserHasRole();
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else {
      setRole(null);
      setIsAdmin(false);
      setPermissions([]);
      setLoading(false);
      roleAssignAttempted.current = false; // Reset the attempt flag when user changes
    }
  }, [fetchRole, user, role, loading]);

  const hasRole = useCallback((requiredRole: AppRole) => {
    return role === requiredRole;
  }, [role]);

  const hasPermission = useCallback((requiredPermission: PermissionAction) => {
    return permissions.includes(requiredPermission);
  }, [permissions]);

  const assignRole = async (userId: string, newRole: AppRole) => {
    try {
      console.log(`Attempting to assign role ${newRole} to user ${userId}`);
      
      // First check if a role already exists
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('id', existingRole.id);
          
        if (error) throw error;
      } else {
        // Create new role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newRole
          });
          
        if (error) throw error;
      }
      
      console.log(`Successfully assigned role ${newRole} to user ${userId}`);
      toast.success(`Role ${newRole} assigned successfully`);
      
      if (user && userId === user.id) {
        roleCache.current[userId] = {
          role: newRole,
          timestamp: Date.now()
        };
        
        setRole(newRole);
        setIsAdmin(newRole === 'admin');
        setPermissions(DEFAULT_ROLE_PERMISSIONS[newRole]);
      }
      
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(`Failed to assign role: ${error.message}`);
      return false;
    }
  };

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
    removeRole,
    permissions,
    fetchRole,
    ensureUserHasRole
  };
}
