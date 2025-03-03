
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExtendedFileAttachment, Json } from "../../types";

export function useFileListData(threadId: string) {
  const [files, setFiles] = useState<ExtendedFileAttachment[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update debug info helper
  const updateDebugInfo = useCallback((message: string) => {
    setDebugInfo(prev => prev + "\n" + message);
    console.log(message); // Also log to console for easier debugging
  }, []);

  // Fetch the raw messages directly
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      updateDebugInfo(`Fetching messages directly for thread: ${threadId}`);
      
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select(`
            id,
            created_at,
            content,
            attachments,
            user_id,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq("thread_id", threadId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching messages:", error);
          updateDebugInfo(`Error fetching messages: ${error.message}`);
          setError(error.message);
          return;
        }
        
        updateDebugInfo(`Fetched ${data?.length || 0} messages directly`);
        
        // Process files from the messages
        const extractedFiles: ExtendedFileAttachment[] = [];
        
        if (data && data.length > 0) {
          // Inspect each message
          data.forEach((message, i) => {
            updateDebugInfo(`Processing message ${i+1}/${data.length} (${message.id})`);
            
            if (!message.attachments || !Array.isArray(message.attachments) || message.attachments.length === 0) {
              updateDebugInfo(`  Message has no attachments`);
              return;
            }
            
            updateDebugInfo(`  Message has ${message.attachments.length} attachments`);
            
            // Process each attachment
            message.attachments.forEach((attachment: Json, j) => {
              updateDebugInfo(`  Processing attachment ${j+1}/${message.attachments.length}`);
              
              // Check if attachment is an object with the expected properties
              if (
                typeof attachment === 'object' && 
                attachment !== null && 
                !Array.isArray(attachment) &&
                'name' in attachment && 
                'url' in attachment && 
                'type' in attachment && 
                'size' in attachment
              ) {
                const name = String(attachment.name || '');
                const url = String(attachment.url || '');
                const type = String(attachment.type || '');
                const size = Number(attachment.size || 0);
                
                if (name && url) {
                  const fileAttachment: ExtendedFileAttachment = {
                    name,
                    url,
                    type,
                    size,
                    user: message.profiles,
                    userId: message.user_id,
                    messageId: message.id,
                    uploadedAt: message.created_at
                  };
                  
                  updateDebugInfo(`  ✅ Valid attachment found: ${name}`);
                  console.log("Adding file:", fileAttachment);
                  extractedFiles.push(fileAttachment);
                } else {
                  updateDebugInfo(`  ❌ Attachment has empty name or url`);
                }
              } else {
                updateDebugInfo(`  ❌ Invalid attachment format`);
                console.log("Invalid attachment:", attachment);
              }
            });
          });
        }
        
        updateDebugInfo(`Total extracted files: ${extractedFiles.length}`);
        setFiles(extractedFiles);
      } catch (e) {
        console.error("Error in message processing:", e);
        updateDebugInfo(`Error in message processing: ${e}`);
        setError(String(e));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [threadId, updateDebugInfo]);

  return { files, setFiles, debugInfo, isLoading, error };
}
