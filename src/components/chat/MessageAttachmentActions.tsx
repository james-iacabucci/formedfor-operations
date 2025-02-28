
import { Save, Trash2, Download, MoreHorizontal } from "lucide-react";
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
  canDelete
}: MessageAttachmentActionsProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/20 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(e);
          }}
        >
          <Download className="h-4 w-4" />
        </Button>

        {canDelete && onDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {onAttachToSculpture && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <Save className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => onAttachToSculpture("renderings")}>
                Save as Rendering
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAttachToSculpture("models")}>
                Save as Model
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAttachToSculpture("dimensions")}>
                Save as Dimension
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAttachToSculpture("other")}>
                Save as Other
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
