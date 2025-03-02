
import { useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { convertToMessage } from "../types";

const PAGE_SIZE = 50;

export function useMessages(threadId: string) {
  const lastMessageRef = useRef<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
          reactions,
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
        throw error;
      }
      
      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (!Array.isArray(lastPage) || lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      const nextCursor = lastPage[lastPage.length - 1]?.created_at;
      return nextCursor;
    },
    initialPageParam: null,
    select: (data) => {
      if (!data?.pages) return { pages: [], pageParams: [] };
      
      const processedData = {
        pages: data.pages.map(page => 
          (Array.isArray(page) ? page : [])
        ),
        pageParams: data.pageParams,
      };

      return processedData;
    },
  });

  // Process and convert the raw messages
  const allMessages = data?.pages?.flatMap(page => page || []).reverse().map(convertToMessage) ?? [];

  return {
    messages: allMessages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isInitialLoad,
    setIsInitialLoad,
    lastMessageRef
  };
}
