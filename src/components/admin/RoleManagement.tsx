
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, UserWithRoles } from "@/types/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserRoles } from "@/hooks/use-user-roles";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Shield, UserCircle } from "lucide-react";

export function RoleManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, assignRole } = useUserRoles();
  
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
          Assign a role to each user in the system.
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
                
                <RadioGroup 
                  value={user.role} 
                  onValueChange={(value) => {
                    handleRoleChange(user.id, value as AppRole);
                  }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  {availableRoles.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <RadioGroupItem value={role} id={`${user.id}-${role}`} />
                      <Label htmlFor={`${user.id}-${role}`} className="capitalize">
                        {role}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
