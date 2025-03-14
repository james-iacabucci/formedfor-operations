
import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { AppRole } from "@/types/roles";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";

interface Permission {
  action: string;
  description: string;
}

interface PermissionCategoryProps {
  category: string;
  permissions: Permission[];
  activeTab: AppRole;
  getCurrentPermissions: (role: AppRole) => Set<string>;
  togglePermission: (role: AppRole, permissionAction: string) => void;
  isSaving?: boolean;
}

export function PermissionCategory({
  category,
  permissions,
  activeTab,
  getCurrentPermissions,
  togglePermission,
  isSaving = false,
}: PermissionCategoryProps) {
  const [open, setOpen] = useState(true);
  const [pendingPermission, setPendingPermission] = useState<string | null>(null);
  const currentPermissions = getCurrentPermissions(activeTab);
  
  const handleTogglePermission = (permissionAction: string) => {
    setPendingPermission(permissionAction);
    togglePermission(activeTab, permissionAction);
    // Clear pending state after a short delay to show loading indicator
    setTimeout(() => setPendingPermission(null), 1000);
  };
  
  return (
    <TabsContent value={activeTab} className="py-2">
      <Collapsible open={open} onOpenChange={setOpen} className="mb-4">
        <CollapsibleTrigger className="flex items-center gap-2 py-2 w-full text-left font-medium text-lg border-b">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="capitalize">{category}</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="grid gap-2">
            {permissions.map((permission) => (
              <div
                key={permission.action}
                className="flex items-center space-x-2 py-1.5"
              >
                <div className="relative">
                  <Checkbox
                    id={`${activeTab}-${permission.action}`}
                    checked={currentPermissions.has(permission.action)}
                    onCheckedChange={() => handleTogglePermission(permission.action)}
                    disabled={isSaving || pendingPermission === permission.action}
                    className={pendingPermission === permission.action ? "opacity-50" : ""}
                  />
                  {pendingPermission === permission.action && (
                    <Loader2 className="h-3 w-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
                  )}
                </div>
                <label
                  htmlFor={`${activeTab}-${permission.action}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {permission.description}
                </label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </TabsContent>
  );
}
