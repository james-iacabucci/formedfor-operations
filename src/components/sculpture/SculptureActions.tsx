
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  TagIcon,
  RefreshCwIcon,
} from "lucide-react";
import { RegenerationSheet } from "./RegenerationSheet";
import { useUserRoles } from "@/hooks/use-user-roles";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";

interface RegenerationOptions {
  creativity: "none" | "small" | "medium" | "large";
  changes?: string;
  updateExisting: boolean;
  regenerateImage: boolean;
  regenerateMetadata: boolean;
}

interface SculptureActionsProps {
  isRegenerating: boolean;
  onManageTags: () => void;
  onRegenerate: (options: RegenerationOptions) => void;
}

export function SculptureActions({
  isRegenerating,
  onManageTags,
  onRegenerate,
}: SculptureActionsProps) {
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const { hasPermission } = useUserRoles();

  const handleRegenerateImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegenerate({
      creativity: "medium",
      updateExisting: true,
      regenerateImage: true,
      regenerateMetadata: false,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <PermissionGuard
          requiredPermission="settings.manage_tags"
          fallback={null}
        >
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onManageTags();
            }}
          >
            <TagIcon className="w-4 h-4" />
          </Button>
        </PermissionGuard>
        
        <PermissionGuard
          requiredPermission="sculpture.regenerate"
          fallback={null}
        >
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white"
            disabled={isRegenerating}
            onClick={handleRegenerateImage}
            title="Regenerate Image"
          >
            <RefreshCwIcon className="w-4 w-4" />
          </Button>
        </PermissionGuard>
      </div>

      <PermissionGuard
        requiredPermission="sculpture.regenerate"
        fallback={null}
      >
        <RegenerationSheet
          open={isRegenerateOpen}
          onOpenChange={setIsRegenerateOpen}
          onRegenerate={onRegenerate}
          isRegenerating={isRegenerating}
        />
      </PermissionGuard>
    </>
  );
}
