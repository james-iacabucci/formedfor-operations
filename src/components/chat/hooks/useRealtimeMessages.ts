
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeMessages(threadId: string, onNewMessage: () => void) {
  useEffect(() => {
    console.log(`Setting up realtime subscription for thread ${threadId}`);
    
    // Set up realtime subscription for new messages
    const channel = supabase
      .channel(`public:chat_messages:thread_id=eq.${threadId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        }, 
        (payload) => {
          console.log('New message received via realtime:', payload);
          onNewMessage();
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for thread ${threadId}:`, status);
      });

    // Clean up subscription when component unmounts
    return () => {
      console.log(`Cleaning up realtime subscription for thread ${threadId}`);
      supabase.removeChannel(channel);
    };
  }, [threadId, onNewMessage]);
}
