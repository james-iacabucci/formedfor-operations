
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

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        throw error;
      }
      
      // Remove the default fallback to 'sales' when no role is found
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
      // Don't set a default role on error
    } finally {
      setLoading(false);
      setTimeout(() => {
        fetchInProgress.current = false;
      }, 300);
    }
  }, [user, lastRefreshTime, role, loading]);

  useEffect(() => {
    if (user) {
      fetchRole(!role);
    } else {
      setRole(null);
      setIsAdmin(false);
      setPermissions([]);
      setLoading(false);
    }
  }, [fetchRole, user, role]);

  const hasRole = useCallback((requiredRole: AppRole) => {
    return role === requiredRole;
  }, [role]);

  const hasPermission = useCallback((requiredPermission: PermissionAction) => {
    return permissions.includes(requiredPermission);
  }, [permissions]);

  const assignRole = async (userId: string, newRole: AppRole) => {
    try {
      console.log(`Attempting to assign role ${newRole} to user ${userId}`);
      
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (error) throw error;
      
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
    fetchRole
  };
}
