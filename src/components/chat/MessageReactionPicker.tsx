
import { 
  Check, 
  Heart, 
  ThumbsUp, 
  HelpCircle 
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageReaction } from "./types";
import { Json } from "@/integrations/supabase/types";

interface MessageReactionPickerProps {
  messageId: string;
  existingReactions: MessageReaction[];
  onClose: () => void;
}

export function MessageReactionPicker({ 
  messageId, 
  existingReactions,
  onClose
}: MessageReactionPickerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const reactions = [
    { id: "thumbs-up", icon: <ThumbsUp className="h-4 w-4" />, label: "👍 Thumbs up" },
    { id: "check", icon: <Check className="h-4 w-4" />, label: "✅ Check" },
    { id: "question-mark", icon: <HelpCircle className="h-4 w-4" />, label: "❓ Question" },
    { id: "heart", icon: <Heart className="h-4 w-4" />, label: "❤️ Love" },
    { id: "strong", icon: <span className="text-sm">💪</span>, label: "💪 Strong" },
    { id: "thank-you", icon: <span className="text-sm">🙏</span>, label: "🙏 Thank you" },
    { id: "agree", icon: <span className="text-sm">💯</span>, label: "💯 Agree" },
  ];
  
  const handleReaction = async (reactionType: string) => {
    if (!user) return;
    
    try {
      // Check if user already has this reaction
      const existingReaction = existingReactions.find(
        r => r.reaction === reactionType && r.user_id === user.id
      );
      
      let updatedReactions: MessageReaction[];
      
      if (existingReaction) {
        // Remove the reaction if it already exists
        updatedReactions = existingReactions.filter(
          r => !(r.reaction === reactionType && r.user_id === user.id)
        );
      } else {
        // Add the new reaction
        const newReaction: MessageReaction = {
          reaction: reactionType,
          user_id: user.id,
          username: user.user_metadata?.username || user.email
        };
        
        updatedReactions = [...existingReactions, newReaction];
      }
      
      console.log("[DEBUG] Updating reactions for message:", messageId);
      console.log("[DEBUG] Updated reactions:", JSON.stringify(updatedReactions));
      
      // Use the update_message_reactions RPC function instead of direct update
      const { data, error } = await supabase.rpc(
        'update_message_reactions',
        {
          message_id: messageId,
          reaction_data: updatedReactions as unknown as Json[]
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
      
      onClose();
    } catch (error) {
      console.error("[DEBUG] Exception in handleReaction:", error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex gap-1">
      {reactions.map((reaction) => {
        const userHasReacted = !!user && existingReactions.some(
          r => r.reaction === reaction.id && r.user_id === user.id
        );
        
        return (
          <button
            key={reaction.id}
            className={`p-2 rounded-md hover:bg-accent transition-colors
              ${userHasReacted ? 'bg-primary/10 text-primary' : ''}`}
            onClick={() => handleReaction(reaction.id)}
            title={reaction.label}
          >
            {reaction.icon}
          </button>
        );
      })}
    </div>
  );
}
