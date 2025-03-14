
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, UserRole } from "@/types/roles";
import { toast } from "sonner";

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_user_roles', {
          _user_id: user.id
        });

        if (error) throw error;
        
        const userRoles = data || [];
        setRoles(userRoles);
        setIsAdmin(userRoles.includes('admin'));
        
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole) => {
    return roles.includes(role);
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) throw error;
      
      toast.success(`Role ${role} assigned successfully`);
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(`Failed to assign role: ${error.message}`);
      return false;
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      
      toast.success(`Role ${role} removed successfully`);
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error(`Failed to remove role: ${error.message}`);
      return false;
    }
  };

  return {
    roles,
    loading,
    isAdmin,
    hasRole,
    assignRole,
    removeRole
  };
}
