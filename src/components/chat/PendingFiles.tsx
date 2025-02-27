
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileCard } from "./FileCard";
import { UploadingFile } from "./types";
import { Progress } from "@/components/ui/progress";

interface PendingFilesProps {
  files: UploadingFile[];
  isSending: boolean;
  onRemove: (id: string) => void;
}

export function PendingFiles({ files, isSending, onRemove }: PendingFilesProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="relative">
          <FileCard file={file.file} />
          {file.progress > 0 && (
            <div className="mt-1">
              <Progress 
                value={file.progress} 
                className="h-1" 
                indicatorClassName={file.progress === 100 ? "bg-green-500" : ""}
              />
              <p className="text-xs text-right mt-0.5 text-muted-foreground">
                {file.progress === 100 ? 'Upload complete' : `Uploading... ${file.progress}%`}
              </p>
            </div>
          )}
          {!isSending && file.progress === 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-background/90"
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
