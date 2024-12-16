import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Trash2Icon,
  DownloadIcon,
  TagIcon,
  CopyIcon,
} from "lucide-react";
import { RegenerationSheet } from "./RegenerationSheet";

interface RegenerationOptions {
  creativity: "none" | "small" | "medium" | "large";
  changes?: string;
  updateExisting: boolean;
  regenerateImage: boolean;
  regenerateMetadata: boolean;
}

interface SculptureActionsProps {
  isRegenerating: boolean;
  onDelete: () => void;
  onDownload: () => void;
  onManageTags: () => void;
  onRegenerate: (options: RegenerationOptions) => void;
}

export function SculptureActions({
  isRegenerating,
  onDelete,
  onDownload,
  onManageTags,
  onRegenerate,
}: SculptureActionsProps) {
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
        >
          <DownloadIcon className="w-4 h-4" />
        </Button>
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
        <Button
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
          disabled={isRegenerating}
          onClick={(e) => {
            e.stopPropagation();
            setIsRegenerateOpen(true);
          }}
          title="Generate Variation"
        >
          <CopyIcon className="w-4 h-4" />
        </Button>
      </div>

      <RegenerationSheet
        open={isRegenerateOpen}
        onOpenChange={setIsRegenerateOpen}
        onRegenerate={onRegenerate}
        isRegenerating={isRegenerating}
      />
    </>
  );
}