
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileAttachment, isFileAttachment } from "./types";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type SortBy = "modified" | "uploaded" | "user";

interface FileListProps {
  threadId: string;
}

interface ExtendedFileAttachment extends FileAttachment {
  user: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  userId: string;
  messageId: string;
  uploadedAt: string;
}

interface MessageData {
  id: string;
  created_at: string;
  attachments: Json[];
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
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
    <div className="flex-1 flex flex-col">
      <Tabs defaultValue="modified" className="w-full" value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
        <div className="px-4 py-2 border-b">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modified">Last Modified</TabsTrigger>
            <TabsTrigger value="uploaded">Upload Date</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {sortedFiles.map((file) => (
              <div 
                key={`${file.messageId}-${file.name}`}
                className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={file.user?.avatar_url || ""} />
                  <AvatarFallback>
                    {file.user?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {file.type?.startsWith('image/') ? (
                  <div className="h-16 w-16 rounded overflow-hidden bg-background border">
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded flex items-center justify-center bg-background border">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(file.uploadedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = file.url;
                      link.download = file.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {user?.id === file.userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteFile(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Attach to Sculpture
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => attachToSculpture(file, "models")}>
                        Models
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => attachToSculpture(file, "renderings")}>
                        Renderings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => attachToSculpture(file, "dimensions")}>
                        Dimensions
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Tabs>

      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
