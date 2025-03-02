
import { useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { convertToMessage } from "../types";

const PAGE_SIZE = 50; // Increased from 20 to 50 messages

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
        
        // Log reactions for debugging
        console.log('First message reactions structure:', firstMsg.reactions);
        console.log('First message reactions type:', typeof firstMsg.reactions);
        console.log('First message reactions is array:', Array.isArray(firstMsg.reactions));
        if (firstMsg.reactions && Array.isArray(firstMsg.reactions) && firstMsg.reactions.length > 0) {
          console.log('First reaction example:', JSON.stringify(firstMsg.reactions[0]));
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
