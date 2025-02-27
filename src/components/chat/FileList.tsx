
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { FileAttachment, isFileAttachment, ExtendedFileAttachment, MessageData, convertToMessage } from "./types";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { FileCard } from "./FileCard";
import { DeleteFileDialog } from "./DeleteFileDialog";

type SortBy = "modified" | "uploaded" | "user";

interface FileListProps {
  threadId: string;
}

export function FileList({ threadId }: FileListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteFile, setDeleteFile] = useState<ExtendedFileAttachment | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("modified");
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Log initial mount info
  useEffect(() => {
    console.log(`FileList mounted with threadId: ${threadId}`);
    return () => console.log("FileList unmounted");
  }, [threadId]);

  // Update debug info helper - created to avoid setting state during render
  const updateDebugInfo = useCallback((message: string) => {
    setDebugInfo(prev => prev + "\n" + message);
  }, []);

  const { data: messagesData, isLoading, error } = useQuery<MessageData[]>({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      console.log("Fetching messages for thread:", threadId);
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
        return [];
      }
      
      console.log("Fetched messages data:", data);
      const messageCount = data?.length || 0;
      updateDebugInfo(`Fetched ${messageCount} messages`);
      
      // Log each message's attachments
      if (data && data.length > 0) {
        data.forEach((msg, i) => {
          const attachmentsCount = Array.isArray(msg.attachments) ? msg.attachments.length : 0;
          console.log(`Message ${i+1}/${data.length} (${msg.id}) has ${attachmentsCount} attachments:`, msg.attachments);
          updateDebugInfo(`Message ${i+1} has ${attachmentsCount} attachments`);
          
          if (attachmentsCount > 0) {
            console.log("Attachment examples:", JSON.stringify(msg.attachments[0], null, 2));
          }
        });
      }
      
      return data ?? [];
    },
    refetchOnWindowFocus: false,
  });

  const handleDeleteFile = async () => {
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

      const updatedAttachments = (message.attachments || [])
        .filter(attachment => {
          if (!isFileAttachment(attachment)) return true;
          return attachment.url !== deleteFile.url;
        });

      const { error: updateError } = await supabase
        .from("chat_messages")
        .update({ attachments: updatedAttachments })
        .eq("id", deleteFile.messageId);

      if (updateError) throw updateError;

      toast({
        title: "File deleted",
        description: "The file has been removed from the chat history.",
      });
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

  const attachToSculpture = async (file: ExtendedFileAttachment, category: "models" | "renderings" | "dimensions" | "other") => {
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

  // Process files from messages - moved to useEffect to avoid state updates during render
  const [files, setFiles] = useState<ExtendedFileAttachment[]>([]);
  
  useEffect(() => {
    if (!Array.isArray(messagesData)) return;
    
    console.log("Current messagesData:", messagesData);
    updateDebugInfo(`Processing ${messagesData.length} messages for files`);
    
    const extractedFiles: ExtendedFileAttachment[] = [];
    
    for (const message of messagesData) {
      if (message?.attachments && Array.isArray(message.attachments)) {
        // Debug the attachments
        console.log("Processing message attachments:", message.attachments);
        updateDebugInfo(`Message ${message.id} has ${message.attachments.length} attachments`);
        
        try {
          // Convert raw message to proper Message type
          const convertedMessage = convertToMessage(message);
          
          // Use the properly typed attachments
          const validAttachments: ExtendedFileAttachment[] = convertedMessage.attachments.map(file => ({
            name: file.name,
            url: file.url,
            type: file.type,
            size: file.size,
            user: message.profiles,
            userId: message.user_id,
            messageId: message.id,
            uploadedAt: message.created_at
          }));
          
          updateDebugInfo(`Found ${validAttachments.length} valid attachments`);
          
          if (validAttachments.length > 0) {
            console.log("First valid attachment:", validAttachments[0]);
          }
          
          extractedFiles.push(...validAttachments);
        } catch (error) {
          console.error("Error processing attachments:", error);
          updateDebugInfo(`Error processing attachments: ${error}`);
        }
      }
    }
    
    console.log("Processed files:", extractedFiles);
    updateDebugInfo(`Total processed files: ${extractedFiles.length}`);
    setFiles(extractedFiles);
  }, [messagesData, updateDebugInfo]);

  // Debug direct messages to thread
  useEffect(() => {
    const fetchDirectMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select('id, created_at, attachments, content')
          .eq("thread_id", threadId)
          .limit(5);
          
        if (error) {
          console.error("Error in direct messages check:", error);
          return;
        }
        
        console.log("Direct thread messages check:", data);
        updateDebugInfo(`Direct check: ${data?.length || 0} messages in thread`);
        
        // Check first message specifically
        if (data && data.length > 0) {
          console.log("First message direct check:", {
            messageId: data[0].id,
            content: data[0].content,
            hasAttachments: !!data[0].attachments,
            attachmentsArray: Array.isArray(data[0].attachments),
            attachmentsLength: Array.isArray(data[0].attachments) ? data[0].attachments.length : 'not an array',
            rawValue: data[0].attachments
          });
        }
      } catch (e) {
        console.error("Error in direct messages fetch:", e);
      }
    };
    
    fetchDirectMessages();
  }, [threadId, updateDebugInfo]);

  const sortedFiles = [...files].sort((a, b) => {
    switch (sortBy) {
      case "modified":
      case "uploaded":
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case "user":
        return (a.user?.username || "").localeCompare(b.user?.username || "");
      default:
        return 0;
    }
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading files...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading files</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="modified" className="w-full" value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
        <div className="px-4 py-2 border-b">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modified">Last Modified</TabsTrigger>
            <TabsTrigger value="uploaded">Upload Date</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {sortedFiles.length > 0 ? (
              sortedFiles.map((file) => (
                <FileCard
                  key={`${file.messageId}-${file.name}`}
                  file={file}
                  canDelete={user?.id === file.userId}
                  onDelete={() => setDeleteFile(file)}
                  onAttachToSculpture={(category) => attachToSculpture(file, category)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No files have been shared in this chat yet
                {debugInfo && (
                  <div className="mt-4 p-3 text-xs text-left border rounded bg-muted overflow-auto max-h-64">
                    <h5 className="font-bold mb-2">Debug Info:</h5>
                    <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>

      <DeleteFileDialog
        isOpen={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={handleDeleteFile}
      />
    </div>
  );
}
