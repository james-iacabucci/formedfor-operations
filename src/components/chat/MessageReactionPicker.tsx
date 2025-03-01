
import { 
  Check, 
  Heart, 
  ThumbsUp, 
  QuestionMark
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageReaction } from "./types";

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
    { id: "question-mark", icon: <QuestionMark className="h-4 w-4" />, label: "❓ Question" },
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
      
      // Update the message with the new reactions
      const { error } = await supabase
        .from("chat_messages")
        .update({ reactions: updatedReactions })
        .eq("id", messageId);
      
      if (error) {
        console.error("Error adding reaction:", error);
        toast({
          title: "Error",
          description: "Failed to add reaction",
          variant: "destructive"
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };
  
  return (
    <div className="rounded-lg border bg-background shadow-md p-1 flex gap-1">
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
