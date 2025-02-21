import { useState, useEffect, useRef } from "react";
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
}

export function MessageInput({ threadId, autoFocus = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "0";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    textarea.addEventListener("input", adjustHeight);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!message.trim() && !uploadingFiles.length)) return;

    setIsSending(true);
    try {
      const filesToUpload = uploadingFiles.map(f => f.file);
      const uploadedFiles = await uploadFiles(filesToUpload, (fileId, progress) => {
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
      });

      const messageData = {
        thread_id: threadId,
        user_id: user.id,
        content: message.trim(),
        attachments: uploadedFiles,
      };

      const { error } = await supabase
        .from("chat_messages")
        .insert(messageData);

      if (error) throw error;

      setMessage("");
      setUploadingFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background space-y-2">
      <div className="relative flex items-end gap-2">
        <div className="flex-1">
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
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
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
      </div>
      
      <PendingFiles 
        files={uploadingFiles}
        isSending={isSending}
        onRemove={handleRemovePendingFile}
      />
    </form>
  );
}
