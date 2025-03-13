
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useQuoteChat(sculptureId: string) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatThreadId, setChatThreadId] = useState<string | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOpenChat = useCallback(async (variantId: string) => {
    try {
      // Look for existing thread for this variant
      const { data: existingThreads, error: fetchError } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("sculpture_id", sculptureId)
        .eq("variant_id", variantId)
        .limit(1);

      if (fetchError) throw fetchError;

      let threadId;

      // If thread exists, use it; otherwise create a new one
      if (existingThreads && existingThreads.length > 0) {
        threadId = existingThreads[0].id;
      } else {
        const { data: newThread, error: createError } = await supabase
          .from("chat_threads")
          .insert({
            sculpture_id: sculptureId,
            variant_id: variantId,
            topic: 'fabrication_quotes'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        threadId = newThread.id;

        // Add current user as participant
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
      setActiveVariantId(variantId);
      setIsChatOpen(true);
    } catch (error) {
      console.error("Error preparing chat:", error);
      toast({
        title: "Error",
        description: "Failed to open chat. Please try again.",
        variant: "destructive",
      });
    }
  }, [sculptureId, toast]);

  return {
    isChatOpen,
    setIsChatOpen,
    chatThreadId,
    activeVariantId,
    handleOpenChat
  };
}
