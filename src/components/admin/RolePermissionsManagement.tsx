
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useUserRoles } from "@/hooks/use-user-roles";
import { ALL_PERMISSIONS } from "@/types/permissions";
import { Shield } from "lucide-react";
import { PermissionCategory } from "./permissions/PermissionCategory";
import { RoleTabHeader } from "./permissions/RoleTabHeader";
import { usePermissionsState } from "./permissions/usePermissionsState";
import { AppRole } from "@/types/roles";

// Define local Permission type since we need to handle the type error
interface Permission {
  action: string;
  description: string;
}

export function RolePermissionsManagement() {
  const { isAdmin } = useUserRoles();
  const {
    activeTab,
    setActiveTab,
    isSaving,
    togglePermission,
    saveChanges,
    resetToDefaults,
    getCurrentPermissions,
    hasChanges
  } = usePermissionsState();
  
  // Group permissions by category
  const permissionCategories = ALL_PERMISSIONS.reduce((acc, permission) => {
    const category = permission.action.split('.')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
  
  if (!isAdmin) {
    return (
      <div className="p-4">
        <p>You don't have permission to manage role permissions.</p>
      </div>
    );
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Permissions Management
        </CardTitle>
        <CardDescription>
          Configure which permissions each role has in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AppRole)}>
          <RoleTabHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            resetToDefaults={resetToDefaults}
            saveChanges={saveChanges}
            hasChanges={hasChanges}
            isSaving={isSaving}
          />
          
          {Object.entries(permissionCategories).map(([category, permissions]) => (
            <TabsContent key={`${activeTab}-${category}`} value={activeTab}>
              <PermissionCategory
                key={category}
                category={category}
                permissions={permissions}
                activeTab={activeTab}
                getCurrentPermissions={getCurrentPermissions}
                togglePermission={togglePermission}
                isSaving={isSaving}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
