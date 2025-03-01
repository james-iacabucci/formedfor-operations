import { useAuth } from "@/components/AuthProvider";
import { MessageReaction } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!reactions || reactions.length === 0) {
    return null;
  }
  
  // Group reactions by type
  const groupedReactions = reactions.reduce<Record<string, MessageReaction[]>>((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = [];
    }
    acc[reaction.reaction].push(reaction);
    return acc;
  }, {});
  
  const handleRemoveReaction = async (reactionType: string) => {
    if (!user) return;
    
    try {
      // Check if user has this reaction
      const hasReaction = reactions.some(r => r.reaction === reactionType && r.user_id === user.id);
      if (!hasReaction) return;
      
      // Get all reactions except the one to remove
      const updatedReactions = reactions.filter(r => !(r.reaction === reactionType && r.user_id === user.id));
      
      // Fetch the message first to get all its current data
      const { data: message, error: fetchError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("id", messageId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching message:", fetchError);
        return;
      }
      
      // Update message with new reactions while keeping other data
      const { error } = await supabase
        .from("chat_messages")
        .update({ 
          attachments: message.attachments,
          content: message.content,
          mentions: message.mentions,
          reactions: updatedReactions 
        })
        .eq("id", messageId);
      
      if (error) {
        console.error("Error removing reaction:", error);
        toast({
          title: "Error",
          description: "Failed to remove reaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  };
  
  const getEmojiContent = (reaction: string) => {
    switch (reaction) {
      case "thumbs-up": return "👍";
      case "check": return "✅";
      case "question-mark": return "❓";
      case "heart": return "❤️";
      case "strong": return "💪";
      case "thank-you": return "🙏";
      case "agree": return "💯";
      default: return "👍";
    }
  };
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([reactionType, reactors]) => {
        const userHasReacted = !!user && reactors.some(r => r.user_id === user.id);
        
        return (
          <button
            key={reactionType}
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full 
              ${userHasReacted ? 'bg-primary/10 text-primary' : 'bg-muted hover:bg-muted/80'}`}
            onClick={() => userHasReacted && handleRemoveReaction(reactionType)}
            title={reactors.map(r => r.username || "User").join(", ")}
          >
            <span>{getEmojiContent(reactionType)}</span>
            <span>{reactors.length}</span>
          </button>
        );
      })}
    </div>
  );
}
