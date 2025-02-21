
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
    <div className="space-y-3">
      {files.map((file) => (
        <div key={file.id}>
          {isImageFile(file.file.type) ? (
            <div className="relative inline-block max-w-sm">
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(file.file)}
                    alt={file.file.name}
                    className="max-h-[300px] object-cover w-full"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <div className="text-sm">Uploading...</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{file.file.name}</span>
                  </div>
                  <span>{formatFileSize(file.file.size)}</span>
                </div>
                <Progress value={file.progress} className="h-1" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40 max-w-md">
              <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{file.file.name}</div>
                <div className="text-xs text-muted-foreground">{formatFileSize(file.file.size)}</div>
                <div className="mt-2">
                  <Progress value={file.progress} className="h-1" />
                </div>
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
