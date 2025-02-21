
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, Download, FileText } from "lucide-react";
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
import { FileAttachment } from "./types";

type SortBy = "modified" | "uploaded" | "user";

interface FileListProps {
  threadId: string;
}

export function FileList({ threadId }: FileListProps) {
  const [sortBy, setSortBy] = useState<SortBy>("modified");

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
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

      if (error) throw error;
      return data;
    },
  });

  // Extract all files from messages
  const files = messages.flatMap((message) => 
    (message.attachments || [])
      .filter((att): att is FileAttachment => 
        typeof att === 'object' && 
        att !== null && 
        'url' in att && 
        'name' in att
      )
      .map(file => ({
        ...file,
        user: message.profiles,
        userId: message.user_id,
        messageId: message.id,
        uploadedAt: message.created_at
      }))
  );

  // Sort files based on selected criteria
  const sortedFiles = [...files].sort((a, b) => {
    switch (sortBy) {
      case "modified":
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case "uploaded":
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case "user":
        return (a.user?.username || "").localeCompare(b.user?.username || "");
      default:
        return 0;
    }
  });

  const attachToSculpture = async (file: FileAttachment & { messageId: string }, category: "models" | "renderings" | "dimensions") => {
    const { data: sculpture } = await supabase
      .from("sculptures")
      .select(category)
      .eq("id", threadId)
      .single();

    if (!sculpture) return;

    const existingFiles = sculpture[category] || [];
    const newFile = {
      id: file.messageId,
      name: file.name,
      url: file.url,
      created_at: new Date().toISOString()
    };

    await supabase
      .from("sculptures")
      .update({ [category]: [...existingFiles, newFile] })
      .eq("id", threadId);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Tabs defaultValue="modified" className="w-full">
        <div className="px-4 py-2 border-b">
          <TabsList>
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
    </div>
  );
}
