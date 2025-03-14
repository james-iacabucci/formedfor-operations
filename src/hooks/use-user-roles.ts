
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/roles";
import { toast } from "sonner";

export function useUserRoles() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
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
        
        const userRole = data?.role || null;
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
        
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const hasRole = (requiredRole: AppRole) => {
    return role === requiredRole;
  };

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
      }
      
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(`Failed to assign role: ${error.message}`);
      return false;
    }
  };

  const removeRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success(`Role removed successfully`);
      
      // If the current user's role is being removed, update the local state
      if (user && userId === user.id) {
        setRole(null);
        setIsAdmin(false);
      }
      
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error(`Failed to remove role: ${error.message}`);
      return false;
    }
  };

  return {
    role,
    loading,
    isAdmin,
    hasRole,
    assignRole,
    removeRole
  };
}
