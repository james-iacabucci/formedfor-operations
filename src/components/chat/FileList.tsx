
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { FileAttachment, isFileAttachment, ExtendedFileAttachment, MessageData } from "./types";
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

  const { data: messagesData } = useQuery<MessageData[]>({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      console.log("Fetching messages for thread:", threadId);
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          id,
          created_at,
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
        return [];
      }
      
      console.log("Fetched messages data:", data);
      return data ?? [];
    },
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

  const attachToSculpture = async (file: ExtendedFileAttachment, category: "models" | "renderings" | "dimensions") => {
    try {
      const { data: sculpture, error: fetchError } = await supabase
        .from("sculptures")
        .select(category)
        .eq("id", threadId)
        .single();

      if (fetchError) throw fetchError;

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

  console.log("Current messagesData:", messagesData);

  const files: ExtendedFileAttachment[] = [];
  
  if (Array.isArray(messagesData)) {
    for (const message of messagesData) {
      if (message?.attachments && Array.isArray(message.attachments)) {
        const validAttachments = message.attachments
          .filter(isFileAttachment)
          .map((file): ExtendedFileAttachment => ({
            name: file.name,
            url: file.url,
            type: file.type,
            size: file.size,
            user: message.profiles,
            userId: message.user_id,
            messageId: message.id,
            uploadedAt: message.created_at
          }));
          
        files.push(...validAttachments);
      }
    }
  }

  console.log("Processed files:", files);

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
            {sortedFiles.map((file) => (
              <FileCard
                key={`${file.messageId}-${file.name}`}
                file={file}
                canDelete={user?.id === file.userId}
                onDelete={setDeleteFile}
                onAttachToSculpture={attachToSculpture}
              />
            ))}
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
