
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
  const [hasScrolled, setHasScrolled] = useState(false);
  
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
  
  // Setup scroll behavior first
  const { 
    scrollRef,
    hasScrolled: scrollStateHasScrolled,
    setShouldScrollToBottom,
    scrollToBottom
  } = useMessageScroll({
    isLoading,
    messages: fetchedMessages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isInitialLoad,
    setIsInitialLoad,
    lastMessageRef
  });
  
  // Apply real-time updates to messages
  useRealtimeMessages({
    threadId,
    refetch,
    lastMessageRef,
    hasScrolled: scrollStateHasScrolled,
    setScrollToBottom: setShouldScrollToBottom
  });
  
  // Scroll to bottom on initial load and when thread changes
  useEffect(() => {
    if (fetchedMessages.length > 0 && !initialScroll) {
      setTimeout(() => {
        scrollToBottom(true);
        setInitialScroll(true);
      }, 200);
    }
  }, [fetchedMessages.length, initialScroll, scrollToBottom]);
  
  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto overflow-x-hidden pt-1 px-4"
    >
      <MessageListContent
        messages={fetchedMessages}
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
