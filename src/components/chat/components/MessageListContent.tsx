
import { User } from "@supabase/supabase-js";
import { MessageItem } from "../MessageItem";
import { Message, UploadingFile } from "../types";
import { Loader2 } from "lucide-react";

interface MessageListContentProps {
  messages: Message[];
  isFetchingNextPage: boolean;
  isLoading: boolean;
  uploadingFiles: UploadingFile[];
  user: User | null;
  threadId: string;
  editingMessage?: Message | null;
  setEditingMessage?: (message: Message | null) => void;
  onReplyToMessage?: (message: Message) => void;
  sculptureId?: string;
}

export function MessageListContent({
  messages,
  isFetchingNextPage,
  isLoading,
  uploadingFiles,
  user,
  threadId,
  editingMessage,
  setEditingMessage,
  onReplyToMessage,
  sculptureId
}: MessageListContentProps) {
  return (
    <div className="pb-4 pt-2 px-4 min-h-full">
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message}
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
            onReplyToMessage={onReplyToMessage}
            sculptureId={sculptureId}
          />
        ))}
      </div>
      
      {uploadingFiles.length > 0 && (
        <div className="py-0.5 mt-4">
          <div className={`flex items-start gap-3 rounded-lg p-4 ${
            user ? 'bg-background text-foreground border border-muted' : 'bg-accent/50'
          }`}>
            <div className="h-8 w-8"></div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-muted-foreground">
                  Uploading...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
