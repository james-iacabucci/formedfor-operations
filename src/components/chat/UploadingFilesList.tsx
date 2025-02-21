
import { FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/utils";
import { UploadingFile } from "./types";
import { format } from "date-fns";

interface UploadingFilesListProps {
  files: UploadingFile[];
}

export function UploadingFilesList({ files }: UploadingFilesListProps) {
  if (!files.length) return null;

  const isImageFile = (type: string) => type.startsWith('image/');

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id}>
          {isImageFile(file.file.type) ? (
            <div className="relative inline-block">
              <img
                src={URL.createObjectURL(file.file)}
                alt={file.file.name}
                className="max-w-[300px] max-h-[200px] rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <div className="text-sm font-medium mb-1">{file.file.name}</div>
                  <div className="text-xs opacity-70">{formatFileSize(file.file.size)}</div>
                  <div className="w-32 mt-2">
                    <Progress value={file.progress} className="h-1" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 max-w-md">
              <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{file.file.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{formatFileSize(file.file.size)}</span>
                  <span>•</span>
                  <span>{format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <div className="mt-2">
                  <Progress value={file.progress} className="h-1" />
                </div>
              </div>
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
