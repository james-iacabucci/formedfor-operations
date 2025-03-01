
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Message, MessageReaction } from "../types";

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
      
      // Convert attachments to Json[] for Supabase
      const attachmentsAsJson: Json[] = [];
      
      if (Array.isArray(message.attachments)) {
        for (const attachment of message.attachments) {
          if (typeof attachment === 'object' && attachment !== null) {
            const jsonAttachment: Record<string, Json> = {};
            
            // Convert to unknown first, then to Record<string, Json>
            const att = attachment as unknown as Record<string, Json>;
            
            if ('name' in att && typeof att.name === 'string') {
              jsonAttachment.name = att.name;
            } else {
              jsonAttachment.name = "";
            }
            
            if ('url' in att && typeof att.url === 'string') {
              jsonAttachment.url = att.url;
            } else {
              jsonAttachment.url = "";
            }
            
            if ('type' in att && typeof att.type === 'string') {
              jsonAttachment.type = att.type;
            } else {
              jsonAttachment.type = "";
            }
            
            if ('size' in att && typeof att.size === 'number') {
              jsonAttachment.size = att.size;
            } else {
              jsonAttachment.size = 0;
            }
            
            attachmentsAsJson.push(jsonAttachment);
          }
        }
      }
      
      const { error } = await supabase
        .from("chat_messages")
        .update({ 
          reactions: updatedReactions,
          content: message.content,
          thread_id: message.thread_id,
          attachments: attachmentsAsJson,
          mentions: message.mentions || []
        })
        .eq("id", message.id);
      
      if (error) {
        console.error("Error adding reaction:", error);
        toast({
          title: "Error",
          description: "Failed to add reaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };
  
  return { handleReaction };
}
