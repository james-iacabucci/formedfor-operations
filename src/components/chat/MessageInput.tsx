
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, PaperclipIcon, X, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Json } from "@/integrations/supabase/types";

interface MessageInputProps {
  threadId: string;
  autoFocus?: boolean;
}

interface FileUpload {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
}

export function MessageInput({ threadId, autoFocus = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const newFiles = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0
    }));
    setUploadingFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFiles = async () => {
    if (!uploadingFiles.length) return [];
    const uploads: FileUpload[] = [];

    try {
      for (const uploadingFile of uploadingFiles) {
        const file = uploadingFile.file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        // Start by updating progress to show upload has begun
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadingFile.id ? { ...f, progress: 10 } : f
        ));

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat_attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Update progress to show upload is complete
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadingFile.id ? { ...f, progress: 100 } : f
        ));

        const { data: { publicUrl } } = supabase.storage
          .from('chat_attachments')
          .getPublicUrl(fileName);

        uploads.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size,
        });
      }

      setUploadingFiles([]);
      return uploads as unknown as Json[];
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePendingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!message.trim() && !uploadingFiles.length)) return;

    setIsSending(true);
    try {
      const uploadedFiles = await uploadFiles();
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          thread_id: threadId,
          user_id: user.id,
          content: message.trim(),
          attachments: uploadedFiles,
        });

      if (error) throw error;

      setMessage("");
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
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="relative flex flex-col gap-2">
        {/* Pending Files Preview */}
        {uploadingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/30">
            {uploadingFiles.map((file) => (
              <div 
                key={file.id} 
                className={cn(
                  "flex items-center gap-2 px-2 py-1 text-sm bg-background rounded border",
                  isSending && "opacity-50"
                )}
              >
                <span className="truncate max-w-[200px]">{file.file.name}</span>
                {!isSending && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemovePendingFile(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Message Input Area */}
        <div className="relative flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[44px] max-h-[200px] resize-none py-3 pr-24 text-sm overflow-y-auto"
              disabled={isSending}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                disabled={isSending}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
              >
                <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
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
      </div>
    </form>
  );
}
