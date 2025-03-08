
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export function useThreads(threadId: string, quoteMode: boolean = false) {
  const { user } = useAuth();
  
  const { data: threads, refetch } = useQuery({
    queryKey: ["chat-threads", threadId, quoteMode],
    queryFn: async () => {
      if (quoteMode) {
        console.log('Fetching thread for quote:', threadId);
        const { data, error } = await supabase
          .from("chat_threads")
          .select("*")
          .eq("id", threadId);

        if (error) {
          console.error("Error fetching thread:", error);
          return [];
        }

        console.log('Fetched thread:', data);
        return data || [];
      } else {
        console.log('Fetching thread for sculpture:', threadId);
        const { data, error } = await supabase
          .from("chat_threads")
          .select("*")
          .eq("sculpture_id", threadId)
          .is("fabrication_quote_id", null)
          .limit(1); // We now only need a single thread for sculpture chat

        if (error) {
          console.error("Error fetching thread:", error);
          return [];
        }

        console.log('Fetched thread:', data);
        return data || [];
      }
    },
  });

  // Create default thread if needed (for sculpture)
  useEffect(() => {
    const createDefaultThread = async () => {
      if (quoteMode || !user || (threads && threads.length > 0)) return;

      console.log('Creating default thread for sculpture:', threadId);
      
      const { error } = await supabase
        .from("chat_threads")
        .insert({
          sculpture_id: threadId,
          topic: "general", // Single general thread for all sculpture chat
          user_id: user.id
        });

      if (error) {
        console.error("Error creating thread:", error);
      } else {
        refetch();
      }
    };

    createDefaultThread();
  }, [threads, threadId, user, refetch, quoteMode]);

  return { threads, refetch };
}
