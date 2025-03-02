
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Message, convertToMessage } from "../types";

interface UseRealtimeMessagesProps {
  threadId: string;
  refetch: () => Promise<any>;
  lastMessageRef: React.MutableRefObject<string | null>;
  hasScrolled: boolean;
  setScrollToBottom: (value: boolean) => void;
}

export function useRealtimeMessages({
  threadId,
  refetch,
  lastMessageRef,
  hasScrolled,
  setScrollToBottom
}: UseRealtimeMessagesProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('[REALTIME] Setting up realtime subscriptions for thread:', threadId);
    
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
          console.log('[REALTIME] Received new message:', payload);
          const currentLastMessage = lastMessageRef.current;
          await refetch();
          
          // Always scroll to bottom when there's a new message unless the user
          // has scrolled up manually to view older messages
          if (!hasScrolled || currentLastMessage === payload.new.id) {
            setScrollToBottom(true);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        },
        async (payload) => {
          console.log('[REALTIME] Message updated:', payload);
          
          // For reaction updates, handle them without full refetch
          if (payload.new && 'reactions' in payload.new) {
            console.log('[REALTIME] Updated message reactions:', payload.new.reactions);
            
            // Optimistically update the cache instead of doing a full refetch
            queryClient.setQueriesData({ queryKey: ["messages", threadId] }, (oldData: any) => {
              if (!oldData?.pages) return oldData;

              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                  if (!page) return page;
                  
                  return page.map((msg: any) => {
                    if (msg.id === payload.new.id) {
                      // Return updated message with the new reactions data
                      return {
                        ...msg,
                        reactions: payload.new.reactions
                      };
                    }
                    return msg;
                  });
                })
              };
            });
          } else {
            // For non-reaction updates, do a full refetch
            await refetch();
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Subscription status:', status);
      });

    return () => {
      console.log('[REALTIME] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [threadId, refetch, hasScrolled, lastMessageRef, setScrollToBottom, queryClient]);
}
