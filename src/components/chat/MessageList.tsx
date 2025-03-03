
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { MessageListContent } from "./components/MessageListContent";
import { Message, ThreadMessageWithProfile, UploadingFile, convertToMessage } from "./types";
import { useEffect, useState } from "react";

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
    queryKey: ["messages", threadId],
    queryFn: async ({ pageParam }) => {
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
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (pageParam) {
        query = query.lt("created_at", pageParam);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
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
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (onLoadMore) {
      onLoadMore();
    }
  }, [isLoading]);

  // Transform raw messages to proper Message objects
  const rawMessages = data?.pages?.flatMap((page) => page) || [];
  const messages = rawMessages.map(msg => convertToMessage(msg));

  // Use InfiniteScroll to handle loading more messages
  return (
    <div className="h-full space-y-2">
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
  );
}
