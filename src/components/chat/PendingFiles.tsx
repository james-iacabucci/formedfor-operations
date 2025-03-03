
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadingFile } from "./types";

interface PendingFilesProps {
  files: UploadingFile[];
  isSending: boolean;
  onRemove: (id: string) => void;
}

export function PendingFiles({ files, isSending, onRemove }: PendingFilesProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((file) => (
        <div 
          key={file.id} 
          className="relative rounded border overflow-hidden group flex items-center space-x-2 bg-background p-2"
        >
          {/* Show preview image for images */}
          {file.file.type.startsWith('image/') && (file.preview || file.existingUrl) && (
            <div className="h-8 w-8 rounded overflow-hidden bg-muted">
              <img 
                src={file.preview || file.existingUrl} 
                alt={file.file.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          <span className="text-xs truncate max-w-[120px]">{file.file.name}</span>
          
          {file.progress < 100 && (
            <div className="h-1 bg-muted overflow-hidden rounded-full w-16">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${file.progress}%` }}
              />
            </div>
          )}
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 opacity-70 hover:opacity-100"
            onClick={() => onRemove(file.id)}
            disabled={isSending}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
