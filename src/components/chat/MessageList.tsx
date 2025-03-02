
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useMessages } from "./hooks/useMessages";
import { useRealtimeMessages } from "./hooks/useRealtimeMessages";
import { useMessageScroll } from "./hooks/useMessageScroll";
import { MessageListContent } from "./components/MessageListContent";
import { Message, UploadingFile } from "./types";

interface MessageListProps {
  threadId: string;
  uploadingFiles: UploadingFile[];
  editingMessage: Message | null;
  setEditingMessage: (message: Message | null) => void;
  onReplyToMessage?: (message: Message) => void;
}

export function MessageList({ 
  threadId, 
  uploadingFiles,
  editingMessage,
  setEditingMessage,
  onReplyToMessage
}: MessageListProps) {
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [initialScroll, setInitialScroll] = useState(false);
  
  const {
    messages: fetchedMessages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isInitialLoad,
    setIsInitialLoad,
    lastMessageRef
  } = useMessages(threadId);
  
  // Apply real-time updates to messages
  const { messages, newMessages } = useRealtimeMessages(fetchedMessages, threadId);

  // Set up scroll behavior
  const { handleScroll, scrollToBottom, isNearBottom } = useMessageScroll({
    scrollContainerRef,
    fetchNextPage,
    hasNextPage,
    newMessages,
    isInitialLoad,
    setIsInitialLoad
  });
  
  // Scroll to bottom on initial load and when thread changes
  useEffect(() => {
    if (messages.length > 0 && !initialScroll) {
      setTimeout(() => {
        scrollToBottom();
        setInitialScroll(true);
      }, 200);
    }
  }, [messages.length, initialScroll, scrollToBottom]);
  
  // Auto-scroll to bottom when new messages arrive if already near bottom
  useEffect(() => {
    if (isNearBottom && newMessages > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [newMessages, isNearBottom, scrollToBottom]);
  
  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overflow-x-hidden pt-1 px-4"
      onScroll={handleScroll}
    >
      <MessageListContent
        messages={messages}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        uploadingFiles={uploadingFiles}
        user={user}
        threadId={threadId}
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
        onReplyToMessage={onReplyToMessage}
      />
    </div>
  );
}
