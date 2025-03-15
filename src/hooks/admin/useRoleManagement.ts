
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, UserWithRoles } from "@/types/roles";
import { useUserRoles } from "@/hooks/use-user-roles";
import { toast } from "sonner";

export function useRoleManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, assignRole } = useUserRoles();
  const [userToDelete, setUserToDelete] = useState<UserWithRoles | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Available roles
  const availableRoles: AppRole[] = ['admin', 'sales', 'fabrication', 'orders'];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) throw profilesError;
        
        // Fetch roles for each user
        const usersWithRoles = await Promise.all(
          profiles.map(async (profile) => {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.id)
              .single();
            
            if (roleError && roleError.code !== 'PGRST116') {
              // PGRST116 is not found error, which is expected if user has no role
              throw roleError;
            }
            
            // Log the role for debugging
            console.log(`User ${profile.username || profile.id} has role: ${roleData?.role || 'sales'}`);
            
            return {
              ...profile,
              role: roleData?.role || 'sales' // Default to 'sales' if no role found
            };
          })
        );
        
        setUsers(usersWithRoles);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    // Always assign a role, never remove
    const success = await assignRole(userId, newRole);
    if (success) {
      // Immediately update the UI
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
      
      // Log the changed role for debugging
      console.log(`Changed role for user ${userId} to ${newRole}`);
      
      // Additionally, force a refresh from the database to ensure consistency
      const { data: updatedRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (roleError) {
        console.error("Error verifying role update:", roleError);
      } else {
        console.log(`Verified role from database: ${updatedRoleData.role}`);
        // If the fetched role is different from what we expected, refresh the user list
        if (updatedRoleData.role !== newRole) {
          // Something odd happened, refresh all users
          setLoading(true);
          supabase
            .from('profiles')
            .select('*')
            .then(({ data: profiles, error: profilesError }) => {
              if (profilesError) {
                console.error("Error refreshing users:", profilesError);
                setLoading(false);
                return;
              }
              
              Promise.all(
                profiles.map(async (profile) => {
                  const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', profile.id)
                    .single();
                  
                  return {
                    ...profile,
                    role: roleData?.role || 'sales'
                  };
                })
              ).then(refreshedUsers => {
                setUsers(refreshedUsers);
                setLoading(false);
              });
            });
        }
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);

      // First, delete the user's role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userToDelete.id);
        
      if (roleError) throw roleError;
      
      // Then delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);
        
      if (profileError) throw profileError;
      
      toast.success("User's profile has been deleted from the system");
      toast.info("Note: The actual auth record requires administrative access");
      
      // Remove user from local state
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user profile");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format role display name
  const formatRoleName = (role: AppRole): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return {
    users,
    loading,
    isAdmin,
    availableRoles,
    handleRoleChange,
    userToDelete,
    setUserToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    handleDeleteUser,
    formatRoleName
  };
}
