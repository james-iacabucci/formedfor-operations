
import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { AppRole } from "@/types/roles";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Permission {
  action: string;
  description: string;
}

interface PermissionCategoryProps {
  category: string;
  permissions: Permission[];
  activeTab: AppRole;
  getCurrentPermissions: (role: AppRole) => Record<string, boolean>;
  togglePermission: (role: AppRole, permissionAction: string) => void;
}

export function PermissionCategory({
  category,
  permissions,
  activeTab,
  getCurrentPermissions,
  togglePermission,
}: PermissionCategoryProps) {
  const [open, setOpen] = useState(true);
  const currentPermissions = getCurrentPermissions(activeTab);
  
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
                <Checkbox
                  id={`${activeTab}-${permission.action}`}
                  checked={currentPermissions[permission.action] || false}
                  onCheckedChange={() => togglePermission(activeTab, permission.action)}
                />
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
