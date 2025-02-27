
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
  pendingMessageSubmitted?: boolean;
}

const PAGE_SIZE = 20;

export function MessageList({ threadId, uploadingFiles = [], pendingMessageSubmitted = false }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [isInitialScroll, setIsInitialScroll] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const lastMessageRef = useRef<string | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

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

      // Debug the fetched data
      console.log('Fetched message data:', data);
      
      if (data && data.length > 0) {
        // Examine the first message for attachments
        const firstMsg = data[0];
        console.log('First message attachments:', firstMsg.attachments);
        if (firstMsg.attachments && Array.isArray(firstMsg.attachments) && firstMsg.attachments.length > 0) {
          console.log('First attachment:', firstMsg.attachments[0]);
        }
      }

      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (!Array.isArray(lastPage) || lastPage.length < PAGE_SIZE) {
        console.log('No more pages available', { 
          lastPageLength: lastPage?.length,
          requiredLength: PAGE_SIZE 
        });
        return undefined;
      }
      const nextCursor = lastPage[lastPage.length - 1]?.created_at;
      console.log('Next cursor:', nextCursor);
      return nextCursor;
    },
    initialPageParam: null,
    select: (data) => {
      if (!data?.pages) return { pages: [], pageParams: [] };
      
      const processedData = {
        pages: data.pages.map(page => 
          (Array.isArray(page) ? page : []).map(message => ({
            ...message,
            attachments: (message.attachments || [])
              .map(attachment => {
                console.log("Processing attachment in message list:", attachment);
                if (typeof attachment === 'object' && attachment !== null) {
                  const hasRequiredProps = 
                    'url' in attachment && 
                    'name' in attachment && 
                    'type' in attachment && 
                    'size' in attachment;
                  
                  console.log("Has required props:", hasRequiredProps);
                  return hasRequiredProps ? attachment : null;
                }
                return null;
              })
              .filter(Boolean),
            mentions: message.mentions || [],
          }))
        ),
        pageParams: data.pageParams,
      };

      return processedData;
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
          scrollElement.scrollTop = scrollElement.scrollHeight;
          setIsInitialScroll(false);
          setShouldScrollToBottom(false);
        }
      }
    };

    scrollToBottom();
  }, [data?.pages, isLoading, isInitialScroll, shouldScrollToBottom]);

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;

    if (!hasScrolled) {
      setHasScrolled(true);
    }

    console.log('Scroll event:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      hasNextPage,
      isFetchingNextPage
    });

    if (scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
      console.log('Triggering next page load');
      fetchNextPage();
    }

    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isNearBottom && allMessages.length > 0) {
      lastMessageRef.current = allMessages[allMessages.length - 1].id;
    }
  };

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewportRef.current = viewport as HTMLDivElement;
      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, [hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allMessages = data?.pages?.flatMap(page => page || []).reverse() ?? [];

  console.log('Render state:', {
    hasNextPage,
    isFetchingNextPage,
    pageCount: data?.pages?.length,
    messageCount: allMessages.length
  });

  // Debug: Log a sample message to check attachment structure
  if (allMessages.length > 0) {
    console.log('Current messagesData:', data);
    console.log('Processed files:', allMessages[0].attachments);
  }

  return (
    <ScrollArea 
      ref={scrollRef} 
      className="h-full"
    >
      <div className="p-4 space-y-6">
        {isFetchingNextPage && (
          <div className="h-8 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        {allMessages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground">
            No messages yet
          </div>
        )}
        {allMessages.map((message) => (
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
    </ScrollArea>
  );
}
