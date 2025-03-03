
import { useState, useEffect, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X, Plus } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { PendingFiles } from "./PendingFiles";
import { UploadingFile } from "./types";
import { uploadFiles } from "./uploadService";
import { useToast } from "@/hooks/use-toast";

interface MessageContentEditorProps {
  initialContent: string;
  initialAttachments: UploadingFile[];
  onCancel: () => void;
  onSave: (content: string, attachments: any[]) => Promise<void>;
}

export function MessageContentEditor({
  initialContent,
  initialAttachments,
  onCancel,
  onSave
}: MessageContentEditorProps) {
  const [editContent, setEditContent] = useState(initialContent);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>(initialAttachments);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Reset the edit content when message changes or edit mode toggles
  useEffect(() => {
    setEditContent(initialContent);
  }, [initialContent]);

  const handleFilesSelected = (files: UploadingFile[]) => {
    setUploadingFiles(prev => [...prev, ...files]);
  };

  const handleRemovePendingFile = (id: string) => {
    setUploadingFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const filesToUpload = uploadingFiles.filter(f => !f.existingUrl);
      
      const existingFiles = uploadingFiles
        .filter(f => f.existingUrl)
        .map(f => ({
          name: f.file.name,
          url: f.existingUrl as string,
          type: f.file.type,
          size: f.file.size
        }));
      
      let uploadedFiles: any[] = [];

      if (filesToUpload.length > 0) {
        const files = filesToUpload.map(f => f.file);
        uploadedFiles = await uploadFiles(files, (fileId, progress) => {
          setUploadingFiles(prev => prev.map(f => {
            if (f.file.name === fileId) {
              return { ...f, progress };
            }
            return f;
          }));
        });
      }
      
      const allAttachments = [...existingFiles, ...uploadedFiles];
      await onSave(editContent, allAttachments);
      
      // Clean up any object URLs to prevent memory leaks
      uploadingFiles.forEach(file => {
        if (file.preview && !file.existingUrl) {
          URL.revokeObjectURL(file.preview);
        }
      });
    } catch (error) {
      console.error("Error saving edit:", error);
      toast({
        title: "Error",
        description: "Failed to save your edit",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without shift to save
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSaving && (editContent.trim() || uploadingFiles.length > 0)) {
        handleSaveEdit();
      }
    }
    // Escape to cancel
    else if (e.key === 'Escape') {
      e.preventDefault();
      
      // Clean up any object URLs to prevent memory leaks
      uploadingFiles.forEach(file => {
        if (file.preview && !file.existingUrl) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      onCancel();
    }
    // Shift+Enter allows line break (default behavior, no need to handle)
  };

  return (
    <div className="border rounded-md p-2 bg-background">
      <Textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[100px] resize-none text-sm mb-2"
        placeholder="Edit your message..."
      />
      
      <PendingFiles 
        files={uploadingFiles}
        isSending={isSaving}
        onRemove={handleRemovePendingFile}
      />
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <FileUpload 
            disabled={isSaving}
            onFilesSelected={handleFilesSelected}
            buttonProps={{
              variant: "ghost",
              size: "sm",
              className: "h-8 w-8 p-0"
            }}
          >
            <Plus className="h-4 w-4" />
          </FileUpload>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveEdit}
            disabled={isSaving || (!editContent.trim() && uploadingFiles.length === 0)}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving
              </span>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
