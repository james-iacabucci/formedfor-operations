
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
  
  console.log('[REACTION-UI] Rendering message reactions:', { messageId, reactionsCount: reactions?.length });
  
  if (!reactions || reactions.length === 0) {
    console.log('[REACTION-UI] No reactions to render');
    return null;
  }
  
  const groupedReactions = reactions.reduce<Record<string, MessageReaction[]>>((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = [];
    }
    acc[reaction.reaction].push(reaction);
    return acc;
  }, {});
  
  console.log('[REACTION-UI] Grouped reactions:', groupedReactions);
  
  const handleRemoveReaction = async (reactionType: string) => {
    if (!user) {
      console.error('[REACTION-UI] No authenticated user found');
      return;
    }
    
    try {
      const hasReaction = reactions.some(r => r.reaction === reactionType && r.user_id === user.id);
      if (!hasReaction) {
        console.log('[REACTION-UI] User does not have this reaction type');
        return;
      }
      
      console.log('[REACTION-UI] Removing reaction:', { messageId, reactionType, userId: user.id });
      
      const updatedReactions = reactions.filter(r => !(r.reaction === reactionType && r.user_id === user.id));
      
      console.log("[REACTION-UI] Removing reaction - message_id:", messageId);
      console.log("[REACTION-UI] Updated reactions:", JSON.stringify(updatedReactions));
      
      const { data, error } = await supabase.rpc(
        'update_message_reactions',
        {
          message_id: messageId,
          reaction_data: updatedReactions
        }
      );
      
      if (error) {
        console.error("[REACTION-UI] Error removing reaction:", error);
        console.error("[REACTION-UI] Error code:", error.code);
        console.error("[REACTION-UI] Error message:", error.message);
        console.error("[REACTION-UI] Error details:", error.details);
        toast({
          title: "Error",
          description: `Failed to remove reaction: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log("[REACTION-UI] Reaction removed successfully:", data);
        toast({
          description: "Reaction removed",
          duration: 2000
        });
      }
    } catch (error) {
      console.error("[REACTION-UI] Exception in handleRemoveReaction:", error);
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
