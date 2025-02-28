
import { Loader2 } from "lucide-react";
import { MessageItem } from "../MessageItem";
import { UploadingFilesList } from "../UploadingFilesList";
import { Message, UploadingFile } from "../types";
import { User } from "@supabase/supabase-js";

interface MessageListContentProps {
  messages: Message[];
  isFetchingNextPage: boolean;
  isLoading: boolean;
  uploadingFiles: UploadingFile[];
  user: User | null;
  threadId: string;
}

export function MessageListContent({
  messages,
  isFetchingNextPage,
  isLoading,
  uploadingFiles,
  user,
  threadId
}: MessageListContentProps) {
  return (
    <div className="p-4 space-y-6">
      {isFetchingNextPage && (
        <div className="h-8 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground">
          No messages yet
        </div>
      )}
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
            profiles: {
              username: user.user_metadata?.username || user.email || 'User',
              avatar_url: user.user_metadata?.avatar_url || null
            },
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
  );
}
