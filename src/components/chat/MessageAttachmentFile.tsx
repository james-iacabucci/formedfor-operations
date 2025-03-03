
import { FileText, Download, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileAttachment } from "./types";
import { formatFileSize } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface MessageAttachmentFileProps {
  attachment: FileAttachment;
  onDownload: (e: React.MouseEvent) => void;
  onDelete?: () => void;
  onAttachToSculpture?: (category: "renderings" | "models" | "dimensions" | "other") => void;
  canDelete?: boolean;
  onPreview: () => void;
}

export function MessageAttachmentFile({ 
  attachment,
  onDownload,
  onDelete,
  onAttachToSculpture,
  canDelete,
  onPreview
}: MessageAttachmentFileProps) {
  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-lg border bg-muted/40 hover:bg-muted/60 transition-colors max-w-[280px] cursor-pointer group"
      onClick={onPreview}
    >
      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="font-medium text-xs truncate">
          {attachment.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatFileSize(attachment.size)}
          </span>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(e);
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
            
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Save className="h-3 w-3" />
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
          </div>
        </div>
      </div>
    </div>
  );
}
