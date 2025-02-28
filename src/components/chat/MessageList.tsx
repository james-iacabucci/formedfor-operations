
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/AuthProvider";
import { UploadingFile } from "./types";
import { useMessages } from "./hooks/useMessages";
import { useRealtimeMessages } from "./hooks/useRealtimeMessages";
import { useMessageScroll } from "./hooks/useMessageScroll";
import { MessageLoading } from "./components/MessageLoading";
import { MessageListContent } from "./components/MessageListContent";

interface MessageListProps {
  threadId: string;
  uploadingFiles?: UploadingFile[];
  pendingMessageSubmitted?: boolean;
}

export function MessageList({ 
  threadId, 
  uploadingFiles = [], 
  pendingMessageSubmitted = false 
}: MessageListProps) {
  const { user } = useAuth();
  
  const {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isInitialLoad,
    setIsInitialLoad,
    lastMessageRef
  } = useMessages(threadId);

  const {
    scrollRef,
    hasScrolled,
    setShouldScrollToBottom
  } = useMessageScroll({
    isLoading,
    messages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isInitialLoad,
    setIsInitialLoad,
    lastMessageRef
  });

  // Set up realtime subscriptions
  useRealtimeMessages({
    threadId,
    refetch,
    lastMessageRef,
    hasScrolled,
    setScrollToBottom: setShouldScrollToBottom
  });

  if (isLoading) {
    return <MessageLoading />;
  }

  console.log('Render state:', {
    hasNextPage,
    isFetchingNextPage,
    messageCount: messages.length
  });

  return (
    <ScrollArea 
      ref={scrollRef} 
      className="h-full"
    >
      <MessageListContent
        messages={messages}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        uploadingFiles={uploadingFiles}
        user={user}
        threadId={threadId}
      />
    </ScrollArea>
  );
}
