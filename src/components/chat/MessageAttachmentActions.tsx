
import { Download, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface MessageAttachmentActionsProps {
  onDownload: (e: React.MouseEvent) => void;
  onDelete?: () => void;
  onAttachToSculpture?: (category: "renderings" | "models" | "dimensions" | "other") => void;
  canDelete?: boolean;
}

export function MessageAttachmentActions({ 
  onDownload, 
  onDelete, 
  onAttachToSculpture,
  canDelete = false 
}: MessageAttachmentActionsProps) {
  return (
    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="secondary"
        size="icon"
        className="bg-black/30 hover:bg-black/50 text-white border-0"
        onClick={(e) => {
          e.stopPropagation();
          onDownload(e);
        }}
      >
        <Download className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white border-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Save className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onAttachToSculpture?.("renderings")}>
            Save as Rendering
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAttachToSculpture?.("models")}>
            Save as Model
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAttachToSculpture?.("dimensions")}>
            Save as Dimension
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAttachToSculpture?.("other")}>
            Save as Other
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {canDelete && (
        <Button
          variant="secondary"
          size="icon"
          className="bg-black/30 hover:bg-black/50 text-white border-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
