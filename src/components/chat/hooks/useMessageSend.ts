
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadFiles } from "../uploadService";
import { UploadingFile } from "../types";

interface UseMessageSendProps {
  threadId: string;
  onUploadingFiles: (files: UploadingFile[]) => void;
  uploadingFiles: UploadingFile[];
  onUploadComplete: (fileIds: string[]) => void;
  resetTextarea: () => void;
  adjustHeight: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function useMessageSend({
  threadId,
  onUploadingFiles,
  uploadingFiles,
  onUploadComplete,
  resetTextarea,
  adjustHeight,
  textareaRef
}: UseMessageSendProps) {
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, message: string) => {
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

      if (messageError) {
        console.error("Error inserting message:", messageError);
        throw messageError;
      }
      
      if (messageData && messageData.length > 0) {
        messageId = messageData[0].id;
        console.log("Created message with ID:", messageId, "and attachments:", uploadedFiles);
      }

      resetTextarea();
      
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return { handleSubmit, isSending };
}
