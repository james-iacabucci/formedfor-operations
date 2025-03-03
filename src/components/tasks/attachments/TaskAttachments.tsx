
import React from 'react';
import { TaskAttachment } from '@/types/task';
import { FileUpload } from '@/components/chat/FileUpload';
import { Button } from '@/components/ui/button';
import { Paperclip, X, FileIcon, ImageIcon, Download, Trash2 } from 'lucide-react';
import { downloadFile } from '@/lib/fileUtils';
import { toast } from 'sonner';

interface TaskAttachmentsProps {
  attachments: TaskAttachment[] | null;
  onAttachmentsChange: (attachments: TaskAttachment[]) => void;
  disabled?: boolean;
}

export function TaskAttachments({ 
  attachments = [], 
  onAttachmentsChange,
  disabled = false
}: TaskAttachmentsProps) {
  const handleFileSelected = async (files: any[]) => {
    try {
      const newAttachments = files.map(file => ({
        id: file.id,
        name: file.file.name,
        url: URL.createObjectURL(file.file),
        file_type: file.file.type,
        size: file.file.size,
        created_at: new Date().toISOString(),
        file // Store the actual file for upload later
      }));
      
      onAttachmentsChange([...(attachments || []), ...newAttachments]);
    } catch (error) {
      console.error('Error handling file selection:', error);
      toast.error('Failed to add attachment');
    }
  };

  const handleRemoveAttachment = (id: string) => {
    if (!attachments) return;
    onAttachmentsChange(attachments.filter(attachment => attachment.id !== id));
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      await downloadFile(attachment.url, attachment.name);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Attachments</h3>
        {!disabled && (
          <FileUpload
            onFilesSelected={handleFileSelected}
            multiple={true}
            accept="*/*"
            maxSize={10 * 1024 * 1024} // 10MB
            buttonProps={{
              variant: "outline",
              size: "sm",
              className: "text-xs"
            }}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4 mr-1" /> Add Files
          </FileUpload>
        )}
      </div>
      
      {attachments && attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
              <div className="flex items-center space-x-2 overflow-hidden">
                {attachment.file_type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                )}
                <span className="text-sm truncate">{attachment.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(attachment.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-muted-foreground italic">
          No attachments added
        </div>
      )}
    </div>
  );
}
