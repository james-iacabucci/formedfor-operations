import { Button } from "@/components/ui/button";
import {
  Trash2Icon,
  DownloadIcon,
  FolderPlusIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  ArrowUpCircleIcon,
} from "lucide-react";

interface SculptureActionsProps {
  isRegenerating: boolean;
  onDelete: () => void;
  onDownload: () => void;
  onAddToFolder: () => void;
  onRegenerate: (creativity: "small" | "medium" | "large") => void;
}

export function SculptureActions({
  isRegenerating,
  onDelete,
  onDownload,
  onAddToFolder,
  onRegenerate,
}: SculptureActionsProps) {
  const getCreativityIcon = (level: "small" | "medium" | "large") => {
    switch (level) {
      case "small":
        return <ArrowUpIcon className="w-4 h-4" />;
      case "medium":
        return <ArrowUpRightIcon className="w-4 h-4" />;
      case "large":
        return <ArrowUpCircleIcon className="w-4 h-4" />;
    }
  };

  return (
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
          onAddToFolder();
        }}
      >
        <FolderPlusIcon className="w-4 h-4" />
      </Button>
      {["small", "medium", "large"].map((level) => (
        <Button
          key={level}
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
          disabled={isRegenerating}
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate(level as "small" | "medium" | "large");
          }}
          title={`${level.charAt(0).toUpperCase() + level.slice(1)} Variation`}
        >
          {getCreativityIcon(level as "small" | "medium" | "large")}
        </Button>
      ))}
    </div>
  );
}