
import { FileText, Download, MoreHorizontal } from "lucide-react";
import { ExtendedFileAttachment } from "./types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface FileCardProps {
  file: File | ExtendedFileAttachment;
  canDelete?: boolean;
  onDelete?: (file: ExtendedFileAttachment) => void;
  onAttachToSculpture?: (category: "models" | "renderings" | "dimensions" | "other") => void;
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
  
  // Format the upload date if available
  const uploadDate = isExtendedFile 
    ? format(new Date(file.uploadedAt), 'MMM d, yyyy h:mm a')
    : null;
  
  // For the last modified date, use the browser's File.lastModified or a placeholder
  const lastModified = !isExtendedFile && 'lastModified' in file
    ? format(new Date(file.lastModified), 'MMM d, yyyy h:mm a')
    : 'N/A';

  const handleDownload = () => {
    if (isExtendedFile) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-accent/10 transition-colors group">
      {isImage ? (
        <div className="h-20 w-20 rounded overflow-hidden bg-muted flex-shrink-0">
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
        <div className="h-20 w-20 rounded flex items-center justify-center bg-muted flex-shrink-0">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{file.name}</div>
        
        {/* File details in a grid layout */}
        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
          {/* File size and shared by on the same row */}
          <div className="flex items-center space-x-2">
            <span>{formatFileSize(file.size)}</span>
            {userName && (
              <>
                <span className="text-gray-400">•</span>
                <span>Shared by: {userName || 'Unknown user'}</span>
              </>
            )}
          </div>
          
          {/* Upload date if available */}
          {uploadDate && (
            <div>Uploaded: {uploadDate}</div>
          )}
          
          {/* Modified date */}
          {!isExtendedFile && 'lastModified' in file ? (
            <div>Modified: {lastModified}</div>
          ) : isExtendedFile && (
            <div>Modified: {uploadDate}</div> 
          )}
        </div>
      </div>
      
      {/* Action buttons that appear on hover - icon only, right justified */}
      {isExtendedFile && (
        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onAttachToSculpture && (
                      <>
                        <DropdownMenuItem onClick={() => onAttachToSculpture("models")}>
                          Save as Model
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAttachToSculpture("renderings")}>
                          Save as Rendering
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAttachToSculpture("dimensions")}>
                          Save as Dimensions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAttachToSculpture("other")}>
                          Save as Other
                        </DropdownMenuItem>
                        
                        {canDelete && onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete(file as ExtendedFileAttachment)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
