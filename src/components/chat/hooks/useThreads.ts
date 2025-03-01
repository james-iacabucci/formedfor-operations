
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export function useThreads(threadId: string) {
  const { user } = useAuth();
  
  const { data: threads, refetch } = useQuery({
    queryKey: ["chat-threads", threadId],
    queryFn: async () => {
      console.log('Fetching threads for sculpture:', threadId);
      const { data, error } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("sculpture_id", threadId);

      if (error) {
        console.error("Error fetching threads:", error);
        return [];
      }

      console.log('Fetched threads:', data);
      return data || [];
    },
  });

  // Create default threads if needed
  useEffect(() => {
    const createDefaultThreads = async () => {
      if (!threads || !user) return;

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
  }, [threads, threadId, user, refetch]);

  return { threads, refetch };
}
