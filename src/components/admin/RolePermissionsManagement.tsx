
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUserRoles } from "@/hooks/use-user-roles";
import { AppRole } from "@/types/roles";
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, PermissionAction } from "@/types/permissions";
import { toast } from "sonner";
import { Shield, Save, Undo, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function RolePermissionsManagement() {
  const { isAdmin } = useUserRoles();
  const [activeTab, setActiveTab] = useState<AppRole>('admin');
  
  // For each role, track its permissions
  const [adminPermissions, setAdminPermissions] = useState<Set<PermissionAction>>(
    new Set(DEFAULT_ROLE_PERMISSIONS.admin)
  );
  const [salesPermissions, setSalesPermissions] = useState<Set<PermissionAction>>(
    new Set(DEFAULT_ROLE_PERMISSIONS.sales)
  );
  const [fabricationPermissions, setFabricationPermissions] = useState<Set<PermissionAction>>(
    new Set(DEFAULT_ROLE_PERMISSIONS.fabrication)
  );
  const [ordersPermissions, setOrdersPermissions] = useState<Set<PermissionAction>>(
    new Set(DEFAULT_ROLE_PERMISSIONS.orders)
  );
  
  // Track if we have unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  
  // Group permissions by category
  const permissionCategories = ALL_PERMISSIONS.reduce((acc, permission) => {
    const category = permission.action.split('.')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS>);
  
  // Handle permission toggle
  const togglePermission = (permission: PermissionAction) => {
    let permissionSet: Set<PermissionAction>;
    let setPermissionSet: React.Dispatch<React.SetStateAction<Set<PermissionAction>>>;
    
    switch (activeTab) {
      case 'admin':
        permissionSet = adminPermissions;
        setPermissionSet = setAdminPermissions;
        break;
      case 'sales':
        permissionSet = salesPermissions;
        setPermissionSet = setSalesPermissions;
        break;
      case 'fabrication':
        permissionSet = fabricationPermissions;
        setPermissionSet = setFabricationPermissions;
        break;
      case 'orders':
        permissionSet = ordersPermissions;
        setPermissionSet = setOrdersPermissions;
        break;
      default:
        return;
    }
    
    const newPermissions = new Set(permissionSet);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    
    setPermissionSet(newPermissions);
    setHasChanges(true);
  };
  
  // Handle saving changes
  const saveChanges = async () => {
    // In the future, this would save to the database
    // For now, we'll just show a success message
    toast.success("Permission changes saved");
    setHasChanges(false);
  };
  
  // Handle resetting to defaults
  const resetToDefaults = () => {
    setAdminPermissions(new Set(DEFAULT_ROLE_PERMISSIONS.admin));
    setSalesPermissions(new Set(DEFAULT_ROLE_PERMISSIONS.sales));
    setFabricationPermissions(new Set(DEFAULT_ROLE_PERMISSIONS.fabrication));
    setOrdersPermissions(new Set(DEFAULT_ROLE_PERMISSIONS.orders));
    setHasChanges(true);
    toast.info("Reset to default permissions");
  };
  
  // Get current permission set based on active tab
  const getCurrentPermissions = () => {
    switch (activeTab) {
      case 'admin':
        return adminPermissions;
      case 'sales':
        return salesPermissions;
      case 'fabrication':
        return fabricationPermissions;
      case 'orders':
        return ordersPermissions;
      default:
        return new Set<PermissionAction>();
    }
  };
  
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
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="fabrication">Fabrication</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetToDefaults}
                className="gap-1"
              >
                <Undo className="h-4 w-4" />
                Reset
              </Button>
              <Button 
                size="sm" 
                onClick={saveChanges} 
                disabled={!hasChanges}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
          
          {Object.entries(permissionCategories).map(([category, permissions]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-medium mb-3 capitalize flex items-center gap-2">
                {category} 
                <Badge variant="outline" className="ml-2">
                  {permissions.length}
                </Badge>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`${activeTab}-${permission.id}`}
                      checked={getCurrentPermissions().has(permission.action)}
                      onCheckedChange={() => togglePermission(permission.action)}
                    />
                    <div className="grid gap-1">
                      <Label 
                        htmlFor={`${activeTab}-${permission.id}`}
                        className="font-medium"
                      >
                        {permission.description}
                      </Label>
                      <div className="flex items-center">
                        <code className="text-xs text-muted-foreground">
                          {permission.action}
                        </code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Permission ID: {permission.action}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
