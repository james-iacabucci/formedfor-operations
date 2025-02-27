
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { FileAttachment, ExtendedFileAttachment, MessageData } from "./types";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { FileCard } from "./FileCard";
import { DeleteFileDialog } from "./DeleteFileDialog";
import { Json } from "@/integrations/supabase/types";

type SortBy = "modified" | "uploaded" | "user";
type SortOrder = "asc" | "desc";

interface FileListProps {
  threadId: string;
}

export function FileList({ threadId }: FileListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteFile, setDeleteFile] = useState<ExtendedFileAttachment | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("modified");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [files, setFiles] = useState<ExtendedFileAttachment[]>([]);

  // Log initial mount info
  useEffect(() => {
    console.log(`FileList mounted with threadId: ${threadId}`);
    return () => console.log("FileList unmounted");
  }, [threadId]);

  // Update debug info helper
  const updateDebugInfo = useCallback((message: string) => {
    setDebugInfo(prev => prev + "\n" + message);
    console.log(message); // Also log to console for easier debugging
  }, []);

  // Fetch the raw messages directly
  useEffect(() => {
    const fetchMessages = async () => {
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
      }
    };
    
    fetchMessages();
  }, [threadId, updateDebugInfo]);

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

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "modified":
      case "uploaded":
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case "user":
        comparison = (a.user?.username || "").localeCompare(b.user?.username || "");
        break;
      default:
        return 0;
    }
    
    // Apply sort order direction
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b">
        {/* Sorting controls - combined in a single row */}
        <div className="flex items-center gap-2">
          {/* Sorting field tabs */}
          <Tabs defaultValue="modified" className="flex-1" value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modified">Last Modified</TabsTrigger>
              <TabsTrigger value="uploaded">Upload Date</TabsTrigger>
              <TabsTrigger value="user">User</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Sort direction tabs */}
          <Tabs defaultValue="desc" className="w-[120px]" value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="asc" className="text-xs px-2">ASC</TabsTrigger>
              <TabsTrigger value="desc" className="text-xs px-2">DESC</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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

      <DeleteFileDialog
        isOpen={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={handleDeleteFile}
      />
    </div>
  );
}
