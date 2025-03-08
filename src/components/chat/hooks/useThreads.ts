
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
        console.log('Fetching threads for sculpture:', threadId);
        const { data, error } = await supabase
          .from("chat_threads")
          .select("*")
          .eq("sculpture_id", threadId)
          .is("fabrication_quote_id", null);

        if (error) {
          console.error("Error fetching threads:", error);
          return [];
        }

        console.log('Fetched threads:', data);
        return data || [];
      }
    },
  });

  // Create default threads if needed (only for sculpture threads, not quote threads)
  useEffect(() => {
    const createDefaultThreads = async () => {
      if (!threads || !user || quoteMode) return;

      const topics: ("pricing" | "fabrication" | "operations")[] = ["pricing", "fabrication", "operations"];
      const missingTopics = topics.filter(topic => 
        !threads.some(thread => thread.topic === topic)
      );

      if (missingTopics.length > 0) {
        console.log('Creating default threads for topics:', missingTopics);
        
        for (const topic of missingTopics) {
          const { error } = await supabase
            .from("chat_threads")
            .insert({
              sculpture_id: threadId,
              topic: topic,
              user_id: user.id
            });

          if (error) {
            console.error(`Error creating thread for ${topic}:`, error);
          }
        }

        refetch();
      }
    };

    createDefaultThreads();
  }, [threads, threadId, user, refetch, quoteMode]);

  return { threads, refetch };
}
