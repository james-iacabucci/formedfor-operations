
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, User, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Json } from "@/integrations/supabase/types";

interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface Message {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  attachments: FileAttachment[];
  mentions: Json[];
  edited_at: string | null;
  thread_id: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  type: string;
  size: number;
}

interface MessageListProps {
  threadId: string;
  uploadingFiles?: UploadingFile[];
}

export function MessageList({ threadId, uploadingFiles = [] }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          id,
          created_at,
          content,
          user_id,
          attachments,
          mentions,
          edited_at,
          thread_id,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Cast the attachments from Json[] to FileAttachment[] with proper type checking
      return (data || []).map(message => ({
        ...message,
        attachments: (message.attachments as unknown[] || []).map((attachment): FileAttachment => {
          const attachmentObj = attachment as Record<string, unknown>;
          return {
            name: String(attachmentObj?.name || ''),
            url: String(attachmentObj?.url || ''),
            type: String(attachmentObj?.type || ''),
            size: Number(attachmentObj?.size || 0)
          };
        })
      })) as Message[];
    },
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, uploadingFiles]);

  const isImageFile = (type: string) => type.startsWith('image/');

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MessageSquare className="h-6 w-6 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm">
                  {message.profiles?.username || "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              {message.content && (
                <div className="mt-1 text-sm whitespace-pre-wrap">{message.content}</div>
              )}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div key={index}>
                      {isImageFile(attachment.type) ? (
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <img 
                            src={attachment.url} 
                            alt={attachment.name}
                            className="max-w-[300px] max-h-[200px] rounded-lg object-cover"
                          />
                        </a>
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">{attachment.name}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Uploading Files Section */}
        {uploadingFiles.length > 0 && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm">Uploading files...</span>
              </div>
              <div className="mt-2 space-y-3">
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Progress value={file.progress} className="h-1" />
                    <span className="text-xs text-muted-foreground">{Math.round(file.progress)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
