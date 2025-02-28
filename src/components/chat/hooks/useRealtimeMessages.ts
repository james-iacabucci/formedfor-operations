
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
          
          // Always scroll to bottom when there's a new message unless the user
          // has scrolled up manually to view older messages
          if (!hasScrolled || currentLastMessage === payload.new.id) {
            setScrollToBottom(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, refetch, hasScrolled, lastMessageRef, setScrollToBottom]);
}
