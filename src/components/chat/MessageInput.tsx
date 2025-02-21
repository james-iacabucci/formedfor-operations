
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile, Image, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  threadId: string;
  autoFocus?: boolean;
  onUploadProgress: (uploads: UploadingFile[]) => void;
}

interface FileUpload {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  type: string;
  size: number;
}

export function MessageInput({ threadId, autoFocus = false, onUploadProgress }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [attachments, setAttachments] = useState<FileUpload[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener("input", adjustHeight);
    return () => textarea.removeEventListener("input", adjustHeight);
  }, []);

  useEffect(() => {
    onUploadProgress(uploadingFiles);
  }, [uploadingFiles, onUploadProgress]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    
    setIsUploading(true);
    const newAttachments: FileUpload[] = [];
    const files = Array.from(e.target.files);
    
    // Create uploading file entries
    const uploadingFileEntries = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      progress: 0,
      type: file.type,
      size: file.size,
    }));
    
    setUploadingFiles(prev => [...prev, ...uploadingFileEntries]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadingFile = uploadingFileEntries[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        // Create upload options with progress tracking
        const options = {
          onUploadProgress: (progress: number) => {
            setUploadingFiles(prev => 
              prev.map(f => 
                f.id === uploadingFile.id 
                  ? { ...f, progress } 
                  : f
              )
            );
          },
        };

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat_attachments')
          .upload(fileName, file, {
            ...options,
            onUploadProgress: (event) => {
              const progress = (event.loaded / event.total) * 100;
              options.onUploadProgress(progress);
            },
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat_attachments')
          .getPublicUrl(fileName);

        newAttachments.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size,
        });

        // Remove the uploading file entry once complete
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
      }

      setAttachments(prev => [...prev, ...newAttachments]);
      toast({
        title: "Files attached",
        description: `${newAttachments.length} file(s) attached successfully.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      // Clear uploading files on error
      setUploadingFiles([]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && attachments.length === 0) || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          thread_id: threadId,
          user_id: user.id,
          content: message.trim(),
          attachments: attachments.map(attachment => ({
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
            size: attachment.size,
          })),
        });

      if (error) throw error;

      setMessage("");
      setAttachments([]);
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
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/30">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 px-2 py-1 text-sm bg-background rounded border">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] pr-[120px] resize-none rounded-xl py-3 text-sm overflow-hidden"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-0.5">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 rounded-full"
              disabled={isSending}
              title="Add emoji (coming soon)"
            >
              <Smile className="h-4 w-4 text-muted-foreground" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 rounded-full relative"
              disabled={isSending || isUploading}
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Image className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full bg-primary hover:bg-primary/90"
              disabled={isSending || (isUploading || (!message.trim() && attachments.length === 0))}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
