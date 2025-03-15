
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sculpture } from "@/types/sculpture";
import { MoreHorizontal, TagIcon, Trash2 } from "lucide-react";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";

interface SculptureActionsProps {
  sculpture: Sculpture;
  onManageTags: (sculpture: Sculpture) => void;
  onDelete: (sculpture: Sculpture) => void;
}

export function SculptureActions({ sculpture, onManageTags, onDelete }: SculptureActionsProps) {
  const { hasPermission } = useUserRoles();
  const hasAnyAction = hasPermission("settings.manage_tags") || hasPermission("sculpture.delete");
  
  if (!hasAnyAction) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasPermission("settings.manage_tags") && (
          <DropdownMenuItem onClick={() => onManageTags(sculpture)}>
            <TagIcon className="mr-2 h-4 w-4" />
            Manage Tags
          </DropdownMenuItem>
        )}
        {hasPermission("sculpture.delete") && (
          <DropdownMenuItem 
            onClick={() => onDelete(sculpture)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
