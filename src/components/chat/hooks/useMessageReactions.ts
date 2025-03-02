
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageReaction } from "../types";
// Import the custom function types (not necessary to import directly, but makes TS aware of the file)
import "@/integrations/supabase/function-types";

export function useMessageReactions(message: Message) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleReaction = async (reactionType: string) => {
    if (!user) {
      console.error("[REACTION] No authenticated user found");
      return;
    }
    
    try {
      console.log("[REACTION] Starting reaction process");
      console.log("[REACTION] Message ID:", message.id);
      console.log("[REACTION] User:", user.id);
      console.log("[REACTION] Reaction type:", reactionType);
      
      // Get existing reactions or initialize empty array
      const existingReactions = Array.isArray(message.reactions) ? message.reactions : [];
      console.log("[REACTION] Existing reactions:", JSON.stringify(existingReactions));
      console.log("[REACTION] Existing reactions type:", typeof existingReactions);
      console.log("[REACTION] Is Array:", Array.isArray(existingReactions));
      
      const existingReaction = existingReactions.find(
        r => r.reaction === reactionType && r.user_id === user.id
      );
      
      let updatedReactions;
      
      if (existingReaction) {
        console.log("[REACTION] Removing existing reaction");
        updatedReactions = existingReactions.filter(
          r => !(r.reaction === reactionType && r.user_id === user.id)
        );
      } else {
        console.log("[REACTION] Adding new reaction");
        const newReaction: MessageReaction = {
          reaction: reactionType,
          user_id: user.id,
          username: user.user_metadata?.username || user.email
        };
        
        updatedReactions = [...existingReactions, newReaction];
      }
      
      console.log("[REACTION] Updated reactions array:", JSON.stringify(updatedReactions));
      console.log("[REACTION] Updated reactions is array:", Array.isArray(updatedReactions));
      
      // Updated: Use a direct update statement instead of calling the function
      // This simplifies the process and avoids potential type conversion issues
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ reactions: updatedReactions })
        .eq('id', message.id);
      
      if (error) {
        console.error("[REACTION] Error updating message:", error);
        toast({
          title: "Error",
          description: `Failed to update reaction: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log("[REACTION] Success updating reactions:", data);
        toast({
          description: existingReaction ? "Reaction removed" : "Reaction added",
          duration: 2000
        });
      }
    } catch (error) {
      console.error("[REACTION] Exception in handleReaction:", error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };
  
  return { handleReaction };
}
