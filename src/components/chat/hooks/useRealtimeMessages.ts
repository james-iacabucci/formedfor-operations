
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
          console.log('[REALTIME] Updated message data:', payload.new);
          
          // Log reaction-specific information if available
          if (payload.new.reactions) {
            console.log('[REALTIME] Updated message reactions:', payload.new.reactions);
            console.log('[REALTIME] Reactions count:', 
              Array.isArray(payload.new.reactions) ? payload.new.reactions.length : 'not an array');
            console.log('[REALTIME] Reactions data type:', 
              typeof payload.new.reactions);
          }
          
          await refetch();
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Subscription status:', status);
      });

    return () => {
      console.log('[REALTIME] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [threadId, refetch, hasScrolled, lastMessageRef, setScrollToBottom]);
}
