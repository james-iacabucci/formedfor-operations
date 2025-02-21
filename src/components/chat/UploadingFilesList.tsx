
import { FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/utils";
import { UploadingFile } from "./types";

interface UploadingFilesListProps {
  files: UploadingFile[];
}

export function UploadingFilesList({ files }: UploadingFilesListProps) {
  if (!files.length) return null;

  const isImageFile = (type: string) => type.startsWith('image/');

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 max-w-md">
          <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
            {isImageFile(file.file.type) ? (
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <img
                  src={URL.createObjectURL(file.file)}
                  alt={file.file.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <FileText className="h-5 w-5 text-foreground/70" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{file.file.name}</div>
            <div className="text-xs text-muted-foreground">{formatFileSize(file.file.size)}</div>
            <div className="mt-2">
              <Progress value={file.progress} className="h-1" />
            </div>
          </div>
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}
