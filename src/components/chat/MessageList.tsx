
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { MessageListContent } from "./components/MessageListContent";
import { Message, ThreadMessageWithProfile, UploadingFile, convertToMessage } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtimeMessages } from "./hooks/useRealtimeMessages";
import { useMessageScroll } from "./hooks/useMessageScroll";
import { useEffect } from "react";

interface MessageListProps {
  threadId: string;
  uploadingFiles?: UploadingFile[];
  onLoadMore?: () => void;
  editingMessage?: Message | null;
  setEditingMessage?: (message: Message | null) => void;
  onReplyToMessage?: (message: Message) => void;
  sculptureId?: string;
}

export function MessageList({ 
  threadId, 
  uploadingFiles = [],
  onLoadMore, 
  editingMessage, 
  setEditingMessage,
  onReplyToMessage,
  sculptureId
}: MessageListProps) {
  const { user } = useAuth();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["messages", threadId, sculptureId],
    queryFn: async ({ pageParam }) => {
      console.log(`Fetching messages for thread ${threadId}, sculptureId: ${sculptureId}, pageParam:`, pageParam);
      let query = supabase
        .from("chat_messages")
        .select(
          `
          id,
          created_at,
          content,
          user_id,
          thread_id,
          reactions,
          attachments,
          profiles (
            username,
            avatar_url
          ),
          edited_at
        `
        )
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true }) 
        .limit(30);
      
      if (pageParam) {
        query = query.gt("created_at", pageParam);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} messages for thread ${threadId}`);
      return data as ThreadMessageWithProfile[];
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: ThreadMessageWithProfile[]) => {
      if (lastPage && lastPage.length > 0) {
        return lastPage[lastPage.length - 1].created_at;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Set up realtime subscription for new messages
  useRealtimeMessages(threadId, () => {
    console.log("New message received, refetching...");
    refetch();
    setShouldScrollToBottom(true);
  });

  // Use the custom hook for scroll behavior
  const { scrollAreaRef, setShouldScrollToBottom } = useMessageScroll({
    isLoading,
    data,
    uploadingFiles
  });

  // Always trigger scroll to bottom when chat opens and messages load
  useEffect(() => {
    if (!isLoading && data?.pages?.length && data.pages[0]?.length) {
      setShouldScrollToBottom(true);
    }
  }, [isLoading, data?.pages]);

  useEffect(() => {
    if (onLoadMore) {
      onLoadMore();
    }
  }, [isLoading]);

  // Transform raw messages to proper Message objects
  const rawMessages = data?.pages?.flatMap((page) => page) || [];
  const messages = rawMessages.map(msg => convertToMessage(msg));

  // Use ScrollArea component to enable scrolling
  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="h-full">
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
          sculptureId={sculptureId}
        />
      </div>
    </ScrollArea>
  );
}
