
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Loader2 } from "lucide-react";
import { MessageItem } from "./MessageItem";
import { UploadingFilesList } from "./UploadingFilesList";
import { UploadingFile, Message, isFileAttachment } from "./types";
import { useAuth } from "@/components/AuthProvider";

interface MessageListProps {
  threadId: string;
  uploadingFiles?: UploadingFile[];
}

const PAGE_SIZE = 20;

export function MessageList({ threadId, uploadingFiles = [] }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [isInitialScroll, setIsInitialScroll] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const lastMessageRef = useRef<string | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ["messages", threadId],
    queryFn: async ({ pageParam = null }) => {
      console.log('Fetching messages for thread:', threadId, 'cursor:', pageParam);
      
      let query = supabase
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
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (pageParam) {
        query = query.lt("created_at", pageParam);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (!Array.isArray(lastPage) || lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return lastPage[lastPage.length - 1]?.created_at;
    },
    initialPageParam: null,
    select: (data) => {
      if (!data?.pages) return { pages: [], pageParams: [] };
      
      return {
        pages: data.pages.map(page => 
          (Array.isArray(page) ? page : []).map(message => ({
            ...message,
            attachments: (message.attachments || [])
              .filter(isFileAttachment),
            mentions: message.mentions || [],
          }))
        ),
        pageParams: data.pageParams,
      };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`room_${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        },
        async (payload) => {
          console.log('Received new message:', payload);
          const currentLastMessage = lastMessageRef.current;
          await refetch();
          
          // Only auto-scroll if we were already at the bottom
          if (!currentLastMessage || currentLastMessage === payload.new.id) {
            setShouldScrollToBottom(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, refetch]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (!scrollRef.current) return;
      
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        const shouldScroll = isInitialScroll || shouldScrollToBottom;
        
        if (shouldScroll) {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: isInitialScroll ? 'auto' : 'smooth'
          });
          
          setIsInitialScroll(false);
          setShouldScrollToBottom(false);
        }
      }
    };

    // Ensure content is rendered before scrolling
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [data?.pages, isLoading, isInitialScroll, shouldScrollToBottom]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }

    // Update last message reference when scrolling near bottom
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    if (isNearBottom && allMessages.length > 0) {
      lastMessageRef.current = allMessages[allMessages.length - 1].id;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MessageSquare className="h-6 w-6 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  const allMessages = data?.pages?.flatMap(page => page || []).reverse() ?? [];

  return (
    <ScrollArea 
      ref={scrollRef} 
      className="h-full" 
      onScroll={handleScroll}
    >
      <div className="p-4 space-y-6">
        {allMessages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {hasNextPage && isFetchingNextPage && (
          <div className="h-8 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
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
    </ScrollArea>
  );
}
