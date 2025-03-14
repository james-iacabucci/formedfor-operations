
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, UserWithRoles } from "@/types/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, UserCircle } from "lucide-react";

export function RoleManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, assignRole, removeRole } = useUserRoles();
  
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
            const { data: roleData, error: roleError } = await supabase.rpc('get_user_roles', {
              _user_id: profile.id
            });
            
            if (roleError) throw roleError;
            
            return {
              ...profile,
              roles: roleData || []
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

  const handleRoleToggle = async (userId: string, role: AppRole, hasRole: boolean) => {
    if (hasRole) {
      // Remove the role
      const success = await removeRole(userId, role);
      if (success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, roles: user.roles.filter(r => r !== role) } 
            : user
        ));
      }
    } else {
      // Add the role
      const success = await assignRole(userId, role);
      if (success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, roles: [...user.roles, role] } 
            : user
        ));
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4">
        <p>You don't have permission to manage roles.</p>
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
          User Role Management
        </CardTitle>
        <CardDescription>
          Assign or remove roles for users in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {users.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            users.map(user => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <UserCircle className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{user.username || 'Unnamed User'}</h3>
                    <p className="text-sm text-muted-foreground">{user.id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableRoles.map(role => {
                    const hasRole = user.roles.includes(role);
                    return (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${user.id}-${role}`}
                          checked={hasRole}
                          onCheckedChange={(checked) => {
                            handleRoleToggle(user.id, role, !!hasRole);
                          }}
                        />
                        <label
                          htmlFor={`${user.id}-${role}`}
                          className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {role}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
