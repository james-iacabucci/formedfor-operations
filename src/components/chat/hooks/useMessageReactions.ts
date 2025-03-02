
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
    if (!user) return;
    
    try {
      const existingReactions = message.reactions || [];
      
      const existingReaction = existingReactions.find(
        r => r.reaction === reactionType && r.user_id === user.id
      );
      
      let updatedReactions;
      
      if (existingReaction) {
        updatedReactions = existingReactions.filter(
          r => !(r.reaction === reactionType && r.user_id === user.id)
        );
      } else {
        const newReaction = {
          reaction: reactionType,
          user_id: user.id,
          username: user.user_metadata?.username || user.email
        };
        
        updatedReactions = [...existingReactions, newReaction];
      }
      
      console.log("[DEBUG] Adding reaction - message_id:", message.id);
      console.log("[DEBUG] Reaction data:", JSON.stringify(updatedReactions));
      
      const { data, error } = await supabase.rpc(
        'update_message_reactions',
        {
          message_id: message.id,
          reaction_data: updatedReactions
        }
      );
      
      if (error) {
        console.error("[DEBUG] Error adding reaction:", error);
        console.error("[DEBUG] Error code:", error.code);
        console.error("[DEBUG] Error message:", error.message);
        console.error("[DEBUG] Error details:", error.details);
        toast({
          title: "Error",
          description: `Failed to add reaction: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log("[DEBUG] Reaction updated successfully:", data);
      }
    } catch (error) {
      console.error("[DEBUG] Exception in handleReaction:", error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    }
  };
  
  return { handleReaction };
}
