
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
      
      const existingReaction = existingReactions.find(
        r => r.reaction === reactionType && r.user_id === user.id
      );
      
      let updatedReactions;
      
      if (existingReaction) {
        updatedReactions = existingReactions
          .filter(r => !(r.reaction === reactionType && r.user_id === user.id))
          .map(r => ({ ...r } as Json));
      } else {
        const newReaction: MessageReaction = {
          reaction: reactionType,
          user_id: user.id,
          username: user.user_metadata?.username || user.email
        };
        
        updatedReactions = [...existingReactions, newReaction].map(r => ({ ...r } as Json));
      }
      
      // Use a direct update statement
      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions: updatedReactions })
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
