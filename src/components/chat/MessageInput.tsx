
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UploadingFile, Message, FileAttachment } from "./types";
import { FileUpload } from "./FileUpload";
import { PendingFiles } from "./PendingFiles";
import { uploadFiles } from "./uploadService";

interface MessageInputProps {
  threadId: string;
  autoFocus?: boolean;
  onUploadingFiles: (files: UploadingFile[]) => void;
  editingMessage: Message | null;
  setEditingMessage: (message: Message | null) => void;
}

export function MessageInput({ 
  threadId, 
  autoFocus = false, 
  onUploadingFiles,
  editingMessage,
  setEditingMessage
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Set up editing mode
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content === "[This message was deleted]" ? "" : editingMessage.content);
      
      // Convert the message attachments to uploading files
      if (editingMessage.attachments && editingMessage.attachments.length > 0) {
        const existingFiles: UploadingFile[] = editingMessage.attachments.map(attachment => ({
          id: crypto.randomUUID(),
          file: new File([], attachment.name, { type: attachment.type }),
          progress: 100,
          existingUrl: attachment.url
        }));
        
        setUploadingFiles(existingFiles);
      } else {
        setUploadingFiles([]);
      }
    }
  }, [editingMessage]);

  useEffect(() => {
    onUploadingFiles(uploadingFiles);
  }, [uploadingFiles, onUploadingFiles]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const adjustHeight = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = "0";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener("input", adjustHeight);
    
    requestAnimationFrame(() => {
      adjustHeight();
    });

    return () => textarea.removeEventListener("input", adjustHeight);
  }, []);

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      
      const newFiles: UploadingFile[] = await Promise.all(
        imageItems.map(async (item) => {
          const file = item.getAsFile();
          if (!file) return null;
          
          const ext = file.type.split('/')[1] || 'png';
          const newFile = new File([file], `pasted-image-${Date.now()}.${ext}`, {
            type: file.type
          });
          
          return {
            id: crypto.randomUUID(),
            file: newFile,
            progress: 0
          };
        })
      );
      
      const validFiles = newFiles.filter((file): file is UploadingFile => file !== null);
      if (validFiles.length > 0) {
        setUploadingFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const handleFilesSelected = (files: UploadingFile[]) => {
    setUploadingFiles(prev => [...prev, ...files]);
  };

  const handleRemovePendingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setMessage("");
    setUploadingFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!message.trim() && !uploadingFiles.length)) return;

    setIsSending(true);
    let messageId: string | null = null;

    try {
      // Filter out files that already exist (from editing)
      const filesToUpload = uploadingFiles.filter(f => !f.existingUrl);
      
      // Get existing files that should be kept
      const existingFiles = uploadingFiles
        .filter(f => f.existingUrl)
        .map(f => ({
          name: f.file.name,
          url: f.existingUrl as string,
          type: f.file.type,
          size: f.file.size
        }));
      
      // Upload new files
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
        
        console.log("Successfully uploaded files:", uploadedFiles);
      }
      
      // Combine existing files and newly uploaded files
      const allAttachments = [...existingFiles, ...uploadedFiles];

      if (editingMessage) {
        // Update existing message
        const { error: messageError } = await supabase
          .from("chat_messages")
          .update({
            content: message.trim(),
            attachments: allAttachments,
            edited_at: new Date().toISOString()
          })
          .eq("id", editingMessage.id);

        if (messageError) throw messageError;
        
        toast({
          description: "Message updated successfully",
          duration: 2000
        });
        
        // Clear editing state
        setEditingMessage(null);
      } else {
        // Create new message
        const { data: messageData, error: messageError } = await supabase
          .from("chat_messages")
          .insert({
            thread_id: threadId,
            user_id: user.id,
            content: message.trim(),
            attachments: allAttachments
          })
          .select();

        if (messageError) throw messageError;
        
        if (messageData && messageData.length > 0) {
          messageId = messageData[0].id;
          console.log("Created message with ID:", messageId, "and attachments:", allAttachments);
        }
      }

      setMessage("");
      
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        requestAnimationFrame(() => {
          adjustHeight();
        });
      }

      setUploadingFiles([]);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: editingMessage ? "Failed to update message" : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background space-y-2">
      {editingMessage && (
        <div className="flex items-center justify-between bg-muted/50 p-2 rounded mb-2">
          <span className="text-sm font-medium">Editing message</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelEditing}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-[200px] resize-none py-3 pr-24 text-sm overflow-y-auto"
          disabled={isSending}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <FileUpload 
            disabled={isSending}
            onFilesSelected={handleFilesSelected}
          />
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full bg-primary hover:bg-primary/90"
            disabled={isSending || (!message.trim() && !uploadingFiles.length)}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <PendingFiles 
        files={uploadingFiles}
        isSending={isSending}
        onRemove={handleRemovePendingFile}
      />
    </form>
  );
}
