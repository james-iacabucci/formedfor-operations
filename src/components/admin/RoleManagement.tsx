
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, UserWithRoles } from "@/types/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Trash } from "lucide-react";
import { ArchiveDeleteDialog } from "@/components/common/ArchiveDeleteDialog";

export function RoleManagement() {
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
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);

      // Instead of using supabase.auth.admin.deleteUser which requires Supabase admin privileges,
      // we'll use a different approach that works with application admin role
      
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
      
      // Note: We can't actually delete the user from auth.users without service role privileges
      // Instead, we'll inform the user that only the profile has been removed from the system
      
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

  const getInitials = (username: string | null): string => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  // Format role display name
  const formatRoleName = (role: AppRole): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!isAdmin) {
    return (
      <div className="p-4">
        <p>You don't have permission to manage users.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage users and their roles in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            users.map(user => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.username || "User"} />
                      <AvatarFallback>
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{user.username || 'Unnamed User'}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select 
                      defaultValue={user.role} 
                      onValueChange={(value) => {
                        handleRoleChange(user.id, value as AppRole);
                      }}
                    >
                      <SelectTrigger className="w-32 sm:w-40">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(role => (
                          <SelectItem key={role} value={role} className="capitalize">
                            {formatRoleName(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setUserToDelete(user);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      <ArchiveDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.username || 'this user'}? This will remove their profile from the system, but the authentication record will require administrative access to fully remove.`}
        onArchive={() => setDeleteDialogOpen(false)} // Required by the component
        onDelete={handleDeleteUser}
        isLoading={isDeleting}
        hideArchive={true}
      />
    </Card>
  );
}
