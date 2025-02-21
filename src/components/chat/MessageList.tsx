
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { MessageItem } from "./MessageItem";
import { UploadingFilesList } from "./UploadingFilesList";
import { UploadingFile, RawMessage, Message, FileAttachment, isFileAttachment } from "./types";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";

interface MessageListProps {
  threadId: string;
  uploadingFiles?: UploadingFile[];
}

export function MessageList({ threadId, uploadingFiles = [] }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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

      return (data as RawMessage[]).map(message => ({
        ...message,
        attachments: (message.attachments || [])
          .filter((attachment): attachment is Record<string, Json> & FileAttachment => 
            isFileAttachment(attachment as Json)
          ),
        mentions: message.mentions || [],
      })) as Message[];
    },
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, uploadingFiles]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MessageSquare className="h-6 w-6 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-6">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {uploadingFiles.length > 0 && user && (
          <MessageItem
            message={{
              id: 'uploading',
              created_at: new Date().toISOString(),
              content: '',
              user_id: user.id,
              profiles: user.user_metadata,
              attachments: [],
              mentions: [],
              edited_at: null,
              thread_id: threadId,
            }}
          >
            <UploadingFilesList files={uploadingFiles} />
          </MessageItem>
        )}
      </div>
    </ScrollArea>
  );
}
