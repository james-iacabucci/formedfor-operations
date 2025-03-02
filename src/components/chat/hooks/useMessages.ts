
import { useRef, useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { convertToMessage } from "../types";

const PAGE_SIZE = 50;

export function useMessages(threadId: string) {
  const lastMessageRef = useRef<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const instanceId = useRef(`messages-instance-${Math.random().toString(36).substring(2, 9)}`).current;

  // Add debugging log on mount
  useEffect(() => {
    console.log(`[DEBUG][useMessages] Instance ${instanceId} mounted for thread: ${threadId}`);
    
    return () => {
      console.log(`[DEBUG][useMessages] Instance ${instanceId} unmounted for thread: ${threadId}`);
    };
  }, [threadId, instanceId]);

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
      console.log(`[DEBUG][useMessages] Fetching page with pageParam: ${pageParam}, threadId: ${threadId}, instance: ${instanceId}`);
      
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

      // Important: ensure strict pagination boundaries based on created_at timestamp
      if (pageParam) {
        query = query.lt("created_at", pageParam);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`[DEBUG][useMessages] Error fetching messages:`, error);
        throw error;
      }
      
      console.log(`[DEBUG][useMessages] Fetched ${data?.length || 0} messages for thread: ${threadId}, instance: ${instanceId}`);
      
      // Check if we have any messages with reactions
      if (data) {
        const messagesWithReactions = data.filter(msg => {
          // Safely check if reactions is an array and has items
          return msg.reactions && Array.isArray(msg.reactions) && msg.reactions.length > 0;
        });
        
        if (messagesWithReactions.length > 0) {
          console.log(`[DEBUG][useMessages] Found ${messagesWithReactions.length} messages with reactions`);
          messagesWithReactions.forEach(msg => {
            if (msg.reactions && Array.isArray(msg.reactions)) {
              console.log(`[DEBUG][useMessages] Message ${msg.id} has ${msg.reactions.length} reactions in DB response`);
            }
          });
        }
      }
      
      return data || [];
    },
    getNextPageParam: (lastPage) => {
      if (!Array.isArray(lastPage) || lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Get the oldest message timestamp for next page query
      const nextCursor = lastPage[lastPage.length - 1]?.created_at;
      return nextCursor;
    },
    initialPageParam: null,
    select: (data) => {
      console.log(`[DEBUG][useMessages] Processing select data with ${data.pages.length} pages, instance: ${instanceId}`);
      
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

  // Check for duplicate messages across pages - this is purely for debugging
  useEffect(() => {
    if (data?.pages && data.pages.length > 1) {
      const allMessageIds = data.pages.flatMap(page => page.map(msg => msg.id));
      const uniqueIds = new Set(allMessageIds);
      
      if (allMessageIds.length !== uniqueIds.size) {
        console.warn(`[DEBUG][useMessages] Found ${allMessageIds.length - uniqueIds.size} duplicate message IDs across pages!`);
        
        // Find the duplicates
        const idCounts = allMessageIds.reduce((acc, id) => {
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});
        
        const duplicates = Object.entries(idCounts)
          .filter(([_, count]) => (count as number) > 1)
          .map(([id]) => id);
          
        console.warn(`[DEBUG][useMessages] Duplicate message IDs:`, duplicates);
      }
    }
  }, [data?.pages]);

  // Process and convert the raw messages
  // NEW: Add deduplication step before processing
  const allMessages = (() => {
    // First, flatten all pages
    const flattenedMessages = data?.pages?.flatMap(page => {
      console.log(`[DEBUG][useMessages] Processing page with ${page?.length || 0} messages`);
      return (Array.isArray(page) ? page : []);
    }) ?? [];
    
    // Deduplicate messages by ID - crucial step to prevent duplicates
    const messageMap = new Map();
    flattenedMessages.forEach(msg => {
      if (!messageMap.has(msg.id)) {
        messageMap.set(msg.id, msg);
      } else {
        console.log(`[DEBUG][useMessages] Dropping duplicate message ${msg.id}`);
      }
    });
    
    // Convert back to array, reverse (for chronological order), and process
    return Array.from(messageMap.values())
      .reverse()
      .map(msg => {
        // Safely check if reactions exists and log
        if (msg.reactions && Array.isArray(msg.reactions)) {
          console.log(`[DEBUG][useMessages] Converting message ${msg.id} with ${msg.reactions.length} reactions`);
        } else {
          console.log(`[DEBUG][useMessages] Converting message ${msg.id} with no reactions`);
        }
        return convertToMessage(msg);
      });
  })();

  // Debug the final results
  useEffect(() => {
    if (allMessages.length > 0) {
      console.log(`[DEBUG][useMessages] Final processed ${allMessages.length} messages, instance: ${instanceId}`);
      
      // Check for messages with reactions
      const messagesWithReactions = allMessages.filter(msg => msg.reactions && Array.isArray(msg.reactions) && msg.reactions.length > 0);
      if (messagesWithReactions.length > 0) {
        console.log(`[DEBUG][useMessages] Final result has ${messagesWithReactions.length} messages with reactions`);
        messagesWithReactions.forEach(msg => {
          console.log(`[DEBUG][useMessages] Message ${msg.id} has ${msg.reactions?.length || 0} reactions in final result`);
        });
      }
    }
  }, [allMessages, instanceId]);

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
