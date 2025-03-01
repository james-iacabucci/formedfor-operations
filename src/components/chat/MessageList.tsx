
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/AuthProvider";
import { UploadingFile, Message } from "./types";
import { useMessages } from "./hooks/useMessages";
import { useRealtimeMessages } from "./hooks/useRealtimeMessages";
import { useMessageScroll } from "./hooks/useMessageScroll";
import { MessageLoading } from "./components/MessageLoading";
import { MessageListContent } from "./components/MessageListContent";
import { useEffect, useState } from "react";
import { MessageInput } from "./MessageInput";

interface MessageListProps {
  threadId: string;
  uploadingFiles?: UploadingFile[];
}

export function MessageList({ 
  threadId, 
  uploadingFiles = []
}: MessageListProps) {
  const { user } = useAuth();
  const [uploadingFilesState, setUploadingFilesState] = useState<UploadingFile[]>([]);
  
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

  // Force scroll to bottom when component mounts
  useEffect(() => {
    setIsInitialLoad(true);
  }, [threadId]);

  // Set up realtime subscriptions
  useRealtimeMessages({
    threadId,
    refetch,
    lastMessageRef,
    hasScrolled,
    setScrollToBottom: setShouldScrollToBottom
  });

  const handleUploadingFilesChange = (files: UploadingFile[]) => {
    setUploadingFilesState(files);
  };

  if (isLoading) {
    return <MessageLoading />;
  }

  console.log('Render state:', {
    hasNextPage,
    isFetchingNextPage,
    messageCount: messages.length
  });

  return (
    <div className="flex flex-col h-full">
      <ScrollArea 
        ref={scrollRef} 
        className="flex-1"
      >
        <MessageListContent
          messages={messages}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          uploadingFiles={uploadingFilesState}
          user={user}
          threadId={threadId}
        />
      </ScrollArea>
      
      <MessageInput 
        threadId={threadId}
        autoFocus
        onUploadingFiles={handleUploadingFilesChange}
      />
    </div>
  );
}
