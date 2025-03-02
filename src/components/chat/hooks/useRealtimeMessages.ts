
import { useEffect, useRef } from "react";
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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const instanceId = useRef(`realtime-instance-${Math.random().toString(36).substring(2, 9)}`).current;

  useEffect(() => {
    console.log(`[DEBUG][REALTIME] Instance ${instanceId} setting up realtime subscriptions for thread: ${threadId}`);
    
    // Check if we already have an active channel
    if (channelRef.current) {
      console.log(`[DEBUG][REALTIME] Removing existing channel before creating new one`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    const channel = supabase
      .channel(`room_${threadId}_${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        },
        async (payload) => {
          console.log(`[DEBUG][REALTIME] Instance ${instanceId} received new message:`, payload);
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
          console.log(`[DEBUG][REALTIME] Instance ${instanceId} message updated:`, payload);
          
          // For reaction updates, handle them without full refetch
          if (payload.new && 'reactions' in payload.new) {
            console.log(`[DEBUG][REALTIME] Instance ${instanceId} updated message reactions:`, payload.new.reactions);
            console.log(`[DEBUG][REALTIME] Raw reaction data from DB:`, JSON.stringify(payload.new.reactions));
            
            try {
              // Optimistically update the cache instead of doing a full refetch
              queryClient.setQueriesData({ queryKey: ["messages", threadId] }, (oldData: any) => {
                if (!oldData?.pages) {
                  console.log(`[DEBUG][REALTIME] No pages in cache to update`);
                  return oldData;
                }

                console.log(`[DEBUG][REALTIME] Updating ${oldData.pages.length} pages in cache`);
                
                const updatedData = {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => {
                    if (!page) return page;
                    
                    const updatedPage = page.map((msg: any) => {
                      if (msg.id === payload.new.id) {
                        console.log(`[DEBUG][REALTIME] Found message to update in cache:`, msg.id);
                        console.log(`[DEBUG][REALTIME] Before update, reactions:`, JSON.stringify(msg.reactions));
                        
                        // Return updated message with the new reactions data
                        const updatedMsg = {
                          ...msg,
                          reactions: payload.new.reactions
                        };
                        
                        console.log(`[DEBUG][REALTIME] After update, reactions:`, JSON.stringify(updatedMsg.reactions));
                        return updatedMsg;
                      }
                      return msg;
                    });
                    
                    return updatedPage;
                  })
                };
                
                console.log(`[DEBUG][REALTIME] Cache update complete`);
                return updatedData;
              });
            } catch (error) {
              console.error(`[DEBUG][REALTIME] Error updating cache:`, error);
              
              // If optimistic update fails, do a full refetch
              console.log(`[DEBUG][REALTIME] Falling back to full refetch`);
              await refetch();
            }
          } else {
            // For non-reaction updates, do a full refetch
            console.log(`[DEBUG][REALTIME] Non-reaction update, doing full refetch`);
            await refetch();
          }
        }
      )
      .subscribe((status) => {
        console.log(`[DEBUG][REALTIME] Instance ${instanceId} subscription status:`, status);
      });
      
    channelRef.current = channel;

    return () => {
      console.log(`[DEBUG][REALTIME] Instance ${instanceId} cleaning up realtime subscription`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [threadId, refetch, hasScrolled, lastMessageRef, setScrollToBottom, queryClient, instanceId]);
}
