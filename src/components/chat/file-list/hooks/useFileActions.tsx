import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ExtendedFileAttachment } from "../../types";
import { useToast } from "@/hooks/use-toast";

export function useFileActions(setFiles: React.Dispatch<React.SetStateAction<ExtendedFileAttachment[]>>) {
  const { toast } = useToast();
  const [deleteFile, setDeleteFile] = useState<ExtendedFileAttachment | null>(null);

  const handleDeleteFile = async (user: any) => {
    if (!deleteFile || !user) return;

    try {
      const { data: message } = await supabase
        .from("chat_messages")
        .select("attachments")
        .eq("id", deleteFile.messageId)
        .single();

      if (!message) {
        throw new Error("Message not found");
      }

      const updatedAttachments = Array.isArray(message.attachments) 
        ? message.attachments.filter(attachment => {
            // Skip non-object attachments
            if (typeof attachment !== 'object' || attachment === null || Array.isArray(attachment)) {
              return true;
            }
            
            // Keep attachments that don't have a url or have a different url
            if (!('url' in attachment)) return true;
            return String(attachment.url) !== deleteFile.url;
          })
        : [];

      const { error: updateError } = await supabase
        .from("chat_messages")
        .update({ attachments: updatedAttachments })
        .eq("id", deleteFile.messageId);

      if (updateError) throw updateError;

      toast({
        title: "File deleted",
        description: "The file has been removed from the chat history.",
      });
      
      // Update local files state to remove the deleted file
      setFiles(prevFiles => prevFiles.filter(file => file.url !== deleteFile.url));
      
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    }

    setDeleteFile(null);
  };

  const attachToSculpture = async (file: ExtendedFileAttachment, category: "models" | "renderings" | "dimensions" | "other", threadId: string) => {
    try {
      const { data: sculpture, error: fetchError } = await supabase
        .from("sculptures")
        .select(category)
        .eq("id", threadId)
        .single();

      if (fetchError) throw fetchError;

      // If category is "other", handle it differently (just show a message)
      if (category === "other") {
        toast({
          title: "Feature coming soon",
          description: "Saving to 'Other' category will be available soon."
        });
        return;
      }

      const existingFiles = sculpture?.[category] || [];
      const newFile = {
        name: file.name,
        url: file.url,
        type: file.type,
        size: file.size,
        created_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from("sculptures")
        .update({ 
          [category]: [...existingFiles, newFile] 
        })
        .eq("id", threadId);

      if (updateError) throw updateError;

      toast({
        title: "File attached",
        description: `The file has been attached to the sculpture's ${category}.`
      });
    } catch (error) {
      console.error("Error attaching file:", error);
      toast({
        title: "Error",
        description: "Failed to attach the file to the sculpture.",
        variant: "destructive"
      });
    }
  };

  return { deleteFile, setDeleteFile, handleDeleteFile, attachToSculpture };
}
