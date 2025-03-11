
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeMessages(threadId: string, onNewMessage: () => void) {
  useEffect(() => {
    // Set up realtime subscription for new messages
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        }, 
        (payload) => {
          console.log('New message received:', payload);
          onNewMessage();
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, onNewMessage]);
}
