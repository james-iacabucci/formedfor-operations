
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UploadingFile } from "./types";
import { FileUpload } from "./FileUpload";
import { PendingFiles } from "./PendingFiles";
import { uploadFiles } from "./uploadService";

interface MessageInputProps {
  threadId: string;
  autoFocus?: boolean;
  onUploadingFiles: (files: UploadingFile[]) => void;
  uploadingFiles: UploadingFile[];
  onUploadComplete: (fileIds: string[]) => void;
  disabled?: boolean;
}

export function MessageInput({ 
  threadId, 
  autoFocus = false, 
  onUploadingFiles,
  uploadingFiles,
  onUploadComplete,
  disabled = false
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        adjustHeight();
      }, 0);
    }
  }, [message]);

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
        onUploadingFiles(validFiles);
      }
    }
  };

  const handleFilesSelected = (files: UploadingFile[]) => {
    onUploadingFiles(files);
  };

  const handleRemovePendingFile = (id: string) => {
    onUploadingFiles(uploadingFiles.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!message.trim() && !uploadingFiles.length)) return;

    setIsSending(true);
    let messageId: string | null = null;

    try {
      const filesToUpload = uploadingFiles;
      let uploadedFiles: any[] = [];

      if (filesToUpload.length > 0) {
        const files = filesToUpload.map(f => f.file);
        uploadedFiles = await uploadFiles(files, (fileId, progress) => {
          onUploadingFiles(uploadingFiles.map(f => {
            if (f.file.name === fileId) {
              return { ...f, progress };
            }
            return f;
          }));
        });
        
        console.log("Successfully uploaded files:", uploadedFiles);
      }

      const { data: messageData, error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          thread_id: threadId,
          user_id: user.id,
          content: message.trim(),
          attachments: uploadedFiles
        })
        .select();

      if (messageError) throw messageError;
      
      if (messageData && messageData.length > 0) {
        messageId = messageData[0].id;
        console.log("Created message with ID:", messageId, "and attachments:", uploadedFiles);
      }

      setMessage("");
      
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        requestAnimationFrame(() => {
          adjustHeight();
        });
      }

      onUploadComplete(uploadingFiles.map(f => f.id));

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    else if (e.key === "Escape") {
      e.preventDefault();
      setMessage("");
      onUploadComplete(uploadingFiles.map(f => f.id));
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        requestAnimationFrame(() => {
          adjustHeight();
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-background space-y-2">      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-[200px] resize-none py-3 pr-24 text-sm overflow-y-auto"
          disabled={isSending || disabled}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <FileUpload 
            disabled={isSending || disabled}
            onFilesSelected={handleFilesSelected}
          />
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full bg-primary hover:bg-primary/90"
            disabled={isSending || disabled || (!message.trim() && !uploadingFiles.length)}
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
