
import { FileText } from "lucide-react";

interface FileCardProps {
  file: File;
}

export function FileCard({ file }: FileCardProps) {
  // Convert file size to human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-background">
      {file.type.startsWith('image/') ? (
        <div className="h-10 w-10 rounded overflow-hidden bg-muted">
          <img 
            src={URL.createObjectURL(file)} 
            alt={file.name}
            className="h-full w-full object-cover"
            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
          />
        </div>
      ) : (
        <div className="h-10 w-10 rounded flex items-center justify-center bg-muted">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
      </div>
    </div>
  );
}
