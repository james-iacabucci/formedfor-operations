
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageReaction } from "../types";
import { Json } from "@/integrations/supabase/types";

export function useMessageReactions(message: Message) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleReaction = async (reactionType: string) => {
    if (!user) {
      return;
    }
    
    try {
      // Get existing reactions or initialize empty array
      const existingReactions = Array.isArray(message.reactions) ? message.reactions : [];
      
      // Check if this specific reaction already exists for this user
      const existingReactionIndex = existingReactions.findIndex(
        r => r.reaction === reactionType && r.user_id === user.id
      );
      
      let updatedReactions: MessageReaction[];
      
      if (existingReactionIndex >= 0) {
        // Remove the reaction if it exists
        updatedReactions = existingReactions.filter((_, index) => index !== existingReactionIndex);
      } else {
        // Add the reaction if it doesn't exist
        const newReaction: MessageReaction = {
          reaction: reactionType,
          user_id: user.id,
          username: user.user_metadata?.username || user.email
        };
        
        updatedReactions = [...existingReactions, newReaction];
      }
      
      // Convert MessageReaction[] to Json[] by casting each object
      const jsonReactions = updatedReactions.map(r => ({ ...r } as Json));
      
      // Use a direct update statement
      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions: jsonReactions })
        .eq('id', message.id);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update reaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };
  
  return { handleReaction };
}
