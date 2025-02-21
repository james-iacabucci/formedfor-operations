
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadingFile } from "./types";

interface PendingFilesProps {
  files: UploadingFile[];
  isSending: boolean;
  onRemove: (id: string) => void;
}

export function PendingFiles({ files, isSending, onRemove }: PendingFilesProps) {
  if (!files.length) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/30">
      {files.map((file) => (
        <div 
          key={file.id} 
          className={cn(
            "flex items-center gap-2 px-2 py-1 text-sm bg-background rounded border",
            isSending && "opacity-50"
          )}
        >
          <span className="truncate max-w-[200px]">{file.file.name}</span>
          {!isSending && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onRemove(file.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
