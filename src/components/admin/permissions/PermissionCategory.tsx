
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PermissionAction, PermissionDefinition } from "@/types/permissions";
import { Info } from "lucide-react";

interface PermissionCategoryProps {
  category: string;
  permissions: PermissionDefinition[];
  activeTab: string;
  getCurrentPermissions: () => Set<PermissionAction>;
  togglePermission: (permission: PermissionAction) => void;
}

export function PermissionCategory({
  category,
  permissions,
  activeTab,
  getCurrentPermissions,
  togglePermission,
}: PermissionCategoryProps) {
  return (
    <div className="mb-6">
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
  );
}
