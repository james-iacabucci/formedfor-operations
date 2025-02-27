
import { UploadingFile } from "./types";
import { FileCard } from "./FileCard";
import { Progress } from "@/components/ui/progress";

interface UploadingFilesListProps {
  files: UploadingFile[];
}

export function UploadingFilesList({ files }: UploadingFilesListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="relative">
          <FileCard file={file.file} />
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
        </div>
      ))}
    </div>
  );
}
