
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

  const isImage = file.type.startsWith('image/');
  const userName = isExtendedFile ? file.user?.username : null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/10 transition-colors">
      {isImage ? (
        <div className="h-14 w-14 rounded overflow-hidden bg-muted flex-shrink-0">
          <img 
            src={imageUrl} 
            alt={file.name}
            className="h-full w-full object-cover"
            onLoad={(e) => {
              // Only revoke URL for regular File objects
              if (!isExtendedFile && imageUrl) {
                URL.revokeObjectURL(imageUrl);
              }
            }}
          />
        </div>
      ) : (
        <div className="h-14 w-14 rounded flex items-center justify-center bg-muted flex-shrink-0">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
        {userName && (
          <div className="text-xs text-muted-foreground mt-1">Shared by: {userName || 'Unknown user'}</div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        {isExtendedFile && canDelete && onDelete && (
          <button 
            onClick={() => onDelete(file as ExtendedFileAttachment)}
            className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            Delete
          </button>
        )}
        
        {isExtendedFile && onAttachToSculpture && (
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => onAttachToSculpture("models")}
              className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Save as Model
            </button>
            <button 
              onClick={() => onAttachToSculpture("renderings")}
              className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Save as Rendering
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
