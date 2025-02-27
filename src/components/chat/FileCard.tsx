
import { FileText } from "lucide-react";
import { ExtendedFileAttachment } from "./types";

interface FileCardProps {
  file: File | ExtendedFileAttachment;
  canDelete?: boolean;
  onDelete?: (file: ExtendedFileAttachment) => void;
  onAttachToSculpture?: (category: "models" | "renderings" | "dimensions") => void;
}

export function FileCard({ file, canDelete, onDelete, onAttachToSculpture }: FileCardProps) {
  // Convert file size to human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Check if the file is an ExtendedFileAttachment (has url property)
  const isExtendedFile = 'url' in file;
  
  // For regular File objects, we generate an object URL
  // For ExtendedFileAttachment, we use the existing URL
  const imageUrl = isExtendedFile 
    ? file.url 
    : file.type.startsWith('image/') 
      ? URL.createObjectURL(file) 
      : '';

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-background">
      {file.type.startsWith('image/') ? (
        <div className="h-10 w-10 rounded overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt={file.name}
            className="h-full w-full object-cover"
            onLoad={(e) => {
              // Only revoke URL for regular File objects
              if (!isExtendedFile && imageUrl) {
                URL.revokeObjectURL((e.target as HTMLImageElement).src);
              }
            }}
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
      
      {isExtendedFile && canDelete && onDelete && (
        <button 
          onClick={() => onDelete(file as ExtendedFileAttachment)}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <FileText className="h-4 w-4" />
        </button>
      )}
      
      {isExtendedFile && onAttachToSculpture && (
        <div className="flex gap-1">
          <button 
            onClick={() => onAttachToSculpture("models")}
            className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
          >
            Model
          </button>
          <button 
            onClick={() => onAttachToSculpture("renderings")}
            className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
          >
            Render
          </button>
        </div>
      )}
    </div>
  );
}
