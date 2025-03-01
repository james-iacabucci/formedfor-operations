
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
}

export function MessageListContent({
  messages,
  isFetchingNextPage,
  isLoading,
  uploadingFiles,
  user,
  threadId,
  editingMessage,
  setEditingMessage
}: MessageListContentProps) {
  return (
    <div className="pb-4 pt-2">
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {messages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
        />
      ))}
      
      {uploadingFiles.length > 0 && (
        <div className="py-0.5">
          <div className={`flex items-start gap-3 px-6 max-w-4xl mx-auto rounded-lg p-4 ${
            user ? 'bg-black text-white border border-muted' : 'bg-accent/50'
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
