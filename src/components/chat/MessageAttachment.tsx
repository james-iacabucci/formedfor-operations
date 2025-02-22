
import { Download, Save, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";
import { FileAttachment } from "./types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { DeleteFileDialog } from "./DeleteFileDialog";

interface MessageAttachmentProps {
  attachment: FileAttachment;
  onDelete?: () => void;
  onAttachToSculpture?: (category: "renderings" | "models" | "dimensions" | "other") => void;
  canDelete?: boolean;
}

export function MessageAttachment({ 
  attachment, 
  onDelete, 
  onAttachToSculpture,
  canDelete = false 
}: MessageAttachmentProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isImageFile = attachment.type.startsWith('image/');

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    window.open(attachment.url, '_blank');
  };

  if (isImageFile) {
    return (
      <>
        <div className="group relative inline-block max-w-sm">
          <div 
            className="rounded-lg overflow-hidden border border-border cursor-pointer"
            onClick={handlePreview}
          >
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="max-h-[300px] object-cover w-full"
            />
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(e);
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
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
            </div>
          </div>
          <div className="mt-1 px-1 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {attachment.name}
              </p>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
        <DeleteFileDialog 
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => {
            onDelete?.();
            setShowDeleteDialog(false);
          }}
        />
      </>
    );
  }

  // Non-image file layout
  return (
    <>
      <div 
        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40 hover:bg-muted/60 transition-colors max-w-md cursor-pointer group"
        onClick={handlePreview}
      >
        <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">
            {attachment.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatFileSize(attachment.size)}
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(e);
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
            </div>
          </div>
        </div>
      </div>
      <DeleteFileDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete?.();
          setShowDeleteDialog(false);
        }}
      />
    </>
  );
}
