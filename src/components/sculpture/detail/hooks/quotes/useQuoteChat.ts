
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useQuoteChat(sculptureId: string, variantId: string | null) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatThreadId, setChatThreadId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOpenChat = useCallback(async () => {
    if (!variantId) {
      toast({
        title: "Error",
        description: "Please select a variant first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if there's an existing thread for this variant
      const { data: existingThreads, error: fetchError } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("sculpture_id", sculptureId)
        .eq("variant_id", variantId)
        .is("fabrication_quote_id", null)
        .limit(1);

      if (fetchError) throw fetchError;

      let threadId;

      if (existingThreads && existingThreads.length > 0) {
        threadId = existingThreads[0].id;
      } else {
        // Create a new thread for this variant
        const { data: newThread, error: createError } = await supabase
          .from("chat_threads")
          .insert({
            sculpture_id: sculptureId,
            variant_id: variantId,
            fabrication_quote_id: null,
            topic: 'general'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        threadId = newThread.id;

        // Add the current user as a participant
        const { error: participantError } = await supabase
          .from("chat_thread_participants")
          .insert({
            thread_id: threadId,
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
          });

        if (participantError) {
          console.error("Error adding participant:", participantError);
        }
      }

      setChatThreadId(threadId);
      setIsChatOpen(true);
    } catch (error) {
      console.error("Error preparing chat:", error);
      toast({
        title: "Error",
        description: "Failed to open chat. Please try again.",
        variant: "destructive",
      });
    }
  }, [sculptureId, variantId, toast]);

  return {
    isChatOpen,
    setIsChatOpen,
    chatThreadId,
    handleOpenChat
  };
}
