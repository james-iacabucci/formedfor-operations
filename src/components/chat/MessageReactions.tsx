
import { useAuth } from "@/components/AuthProvider";
import { MessageReaction } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Check, ThumbsUp, Eye, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import "@/integrations/supabase/function-types";

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
      const hasReaction = reactions.some(r => r.reaction === reactionType && r.user_id === user.id);
      if (!hasReaction) return;
      
      const updatedReactions = reactions.filter(r => !(r.reaction === reactionType && r.user_id === user.id));
      
      console.log("[DEBUG] Removing reaction - message_id:", messageId);
      console.log("[DEBUG] Updated reactions:", JSON.stringify(updatedReactions));
      
      const { data, error } = await supabase.rpc(
        'update_message_reactions',
        {
          message_id: messageId,
          reaction_data: updatedReactions
        }
      );
      
      if (error) {
        console.error("[DEBUG] Error removing reaction:", error);
        console.error("[DEBUG] Error code:", error.code);
        console.error("[DEBUG] Error message:", error.message);
        console.error("[DEBUG] Error details:", error.details);
        toast({
          title: "Error",
          description: `Failed to remove reaction: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log("[DEBUG] Reaction removed successfully:", data);
      }
    } catch (error) {
      console.error("[DEBUG] Exception in handleRemoveReaction:", error);
      toast({
        title: "Error", 
        description: "Failed to remove reaction",
        variant: "destructive"
      });
    }
  };
  
  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case "thumbs-up": return <ThumbsUp className="h-3 w-3 mr-1" />;
      case "check": return <Check className="h-3 w-3 mr-1" />;
      case "eyes": return <Eye className="h-3 w-3 mr-1" />;
      case "copy": return <Copy className="h-3 w-3 mr-1" />;
      default: return <ThumbsUp className="h-3 w-3 mr-1" />;
    }
  };
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Object.entries(groupedReactions).map(([reactionType, reactors]) => {
        const userHasReacted = !!user && reactors.some(r => r.user_id === user.id);
        
        return (
          <Badge
            key={reactionType}
            variant={userHasReacted ? "default" : "outline"}
            className={`px-2 h-6 py-0 rounded-md text-xs flex items-center gap-1 cursor-pointer transition-colors hover:bg-muted
              ${userHasReacted ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background hover:bg-muted/80'}`}
            onClick={() => userHasReacted && handleRemoveReaction(reactionType)}
            title={reactors.map(r => r.username || "User").join(", ")}
          >
            {getReactionIcon(reactionType)}
            <span>{reactors.length}</span>
          </Badge>
        );
      })}
    </div>
  );
}
