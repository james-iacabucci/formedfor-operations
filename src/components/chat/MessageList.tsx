
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Loader2 } from "lucide-react";
import { MessageItem } from "./MessageItem";
import { UploadingFilesList } from "./UploadingFilesList";
import { UploadingFile, RawMessage, Message, FileAttachment, isFileAttachment } from "./types";
import { Json } from "@/integrations/supabase/types";
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

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["messages", threadId],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
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
        .order("created_at", { ascending: false }) // Changed to fetch newest first
        .range(from, to);

      if (error) throw error;

      return (data || []).reverse() as RawMessage[]; // Reverse to maintain chronological order in UI
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !Array.isArray(lastPage)) return undefined;
      return lastPage.length >= PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    select: (data) => {
      if (!data?.pages) return { pages: [], pageParams: [] };
      
      return {
        pages: data.pages.map(page => 
          (Array.isArray(page) ? page : []).map(message => ({
            ...message,
            attachments: (message.attachments || [])
              .filter(isFileAttachment) as FileAttachment[],
            mentions: message.mentions || [],
          }))
        ),
        pageParams: data.pageParams,
      };
    },
  });

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      intersectionObserver.observe(loadMoreTrigger);
    }

    return () => {
      intersectionObserver.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (!scrollRef.current || !isInitialScroll) return;
      
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement && !isLoading && data?.pages?.[0]?.length) {
        requestAnimationFrame(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
          setIsInitialScroll(false);
        });
      }
    };

    scrollToBottom();

    // Additional check after content might have been painted
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [data, isLoading, isInitialScroll]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <MessageSquare className="h-6 w-6 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  const allMessages = data?.pages.flatMap(page => page) ?? [];

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      {hasNextPage && (
        <div id="load-more-trigger" className="h-8 flex items-center justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <div className="text-sm text-muted-foreground">Load more...</div>
          )}
        </div>
      )}
      <div className="space-y-6">
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
