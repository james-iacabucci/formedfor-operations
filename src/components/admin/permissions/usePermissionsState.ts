
import { useState } from "react";
import { AppRole } from "@/types/roles";
import { DEFAULT_ROLE_PERMISSIONS, PermissionAction } from "@/types/permissions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Add loading state
  const [isSaving, setIsSaving] = useState(false);
  
  // Handle permission toggle with immediate save
  const togglePermission = async (role: AppRole, permission: string) => {
    let permissionSet: Set<PermissionAction>;
    let setPermissionSet: React.Dispatch<React.SetStateAction<Set<PermissionAction>>>;
    
    switch (role) {
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
    if (newPermissions.has(permission as PermissionAction)) {
      newPermissions.delete(permission as PermissionAction);
    } else {
      newPermissions.add(permission as PermissionAction);
    }
    
    // Update state immediately for responsive UI
    setPermissionSet(newPermissions);
    
    // Save changes to the database
    try {
      setIsSaving(true);
      
      // In a real implementation, we would save to the database here
      // For now, we'll just simulate a save with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In the future, this would be an actual save operation:
      // await supabase.from('role_permissions').upsert([...])
      
      // Show success toast
      toast.success(`Permission updated for ${role} role`);
    } catch (error) {
      console.error("Error saving permission change:", error);
      toast.error(`Failed to update permission for ${role} role`);
      
      // Revert the state change on error
      setPermissionSet(permissionSet);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save multiple changes at once
  const saveChanges = async () => {
    try {
      setIsSaving(true);
      
      // In a real implementation, we would save to the database here
      // For the moment, we'll use a simulated save with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Permission changes saved");
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permission changes");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset to defaults with immediate save
  const resetToDefaults = async () => {
    try {
      setIsSaving(true);
      
      // Update state immediately
      setAdminPermissions(new Set(DEFAULT_ROLE_PERMISSIONS.admin));
      setSalesPermissions(new Set(DEFAULT_ROLE_PERMISSIONS.sales));
      setFabricationPermissions(new Set(DEFAULT_ROLE_PERMISSIONS.fabrication));
      setOrdersPermissions(new Set(DEFAULT_ROLE_PERMISSIONS.orders));
      
      // Simulated save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Reset to default permissions");
    } catch (error) {
      console.error("Error resetting permissions:", error);
      toast.error("Failed to reset permissions");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Get current permission set based on active tab
  const getCurrentPermissions = (role: AppRole) => {
    switch (role) {
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
    isSaving,
    togglePermission,
    saveChanges,
    resetToDefaults,
    getCurrentPermissions,
  };
}
