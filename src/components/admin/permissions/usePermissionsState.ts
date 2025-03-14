
import { useState } from "react";
import { AppRole } from "@/types/roles";
import { DEFAULT_ROLE_PERMISSIONS, PermissionAction } from "@/types/permissions";
import { toast } from "sonner";

export function usePermissionsState() {
  const [activeTab, setActiveTab] = useState<AppRole>("admin");
  
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
  
  // Handle permission toggle
  const togglePermission = (permission: PermissionAction) => {
    let permissionSet: Set<PermissionAction>;
    let setPermissionSet: React.Dispatch<React.SetStateAction<Set<PermissionAction>>>;
    
    switch (activeTab) {
      case "admin":
        permissionSet = adminPermissions;
        setPermissionSet = setAdminPermissions;
        break;
      case "sales":
        permissionSet = salesPermissions;
        setPermissionSet = setSalesPermissions;
        break;
      case "fabrication":
        permissionSet = fabricationPermissions;
        setPermissionSet = setFabricationPermissions;
        break;
      case "orders":
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
      case "admin":
        return adminPermissions;
      case "sales":
        return salesPermissions;
      case "fabrication":
        return fabricationPermissions;
      case "orders":
        return ordersPermissions;
      default:
        return new Set<PermissionAction>();
    }
  };
  
  return {
    activeTab,
    setActiveTab,
    hasChanges,
    togglePermission,
    saveChanges,
    resetToDefaults,
    getCurrentPermissions,
  };
}
