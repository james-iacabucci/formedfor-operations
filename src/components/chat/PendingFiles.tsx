
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadingFile } from "./types";
import { format } from "date-fns";

interface PendingFilesProps {
  files: UploadingFile[];
  isSending: boolean;
  onRemove: (id: string) => void;
}

export function PendingFiles({ files, isSending, onRemove }: PendingFilesProps) {
  if (!files.length) return null;

  const isImageFile = (type: string) => type.startsWith('image/');

  return (
    <div className="flex flex-col gap-2">
      {files.map((file) => (
        <div 
          key={file.id} 
          className={cn(
            "flex items-center gap-3 p-2 bg-muted/30 rounded-lg border",
            isSending && "opacity-50"
          )}
        >
          {/* Thumbnail or File Icon */}
          <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-background border">
            {isImageFile(file.file.type) ? (
              <img
                src={URL.createObjectURL(file.file)}
                alt={file.file.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-medium uppercase">
                {file.file.type.split('/')[1] || 'file'}
              </div>
            )}
          </div>

          {/* File Details */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {file.file.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(file.file.lastModified, 'MMM d, yyyy h:mm a')}
            </div>
          </div>

          {/* Remove Button */}
          {!isSending && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={() => onRemove(file.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
