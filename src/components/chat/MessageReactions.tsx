
import { useAuth } from "@/components/AuthProvider";
import { MessageReaction } from "./types";
import { Check, ThumbsUp, Eye, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  if (!reactions || reactions.length === 0) {
    return null;
  }
  
  // Group reactions by type - trusting that incoming data is already deduplicated
  const groupedReactions = reactions.reduce<Record<string, MessageReaction[]>>((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = [];
    }
    
    acc[reaction.reaction].push(reaction);
    
    return acc;
  }, {});
  
  // Set up mutation for removing reactions
  const removeReactionMutation = useMutation({
    mutationFn: async ({ updatedReactions }: { updatedReactions: MessageReaction[] }) => {
      // Convert MessageReaction[] to Json[] for database
      const jsonReactions = updatedReactions.map(r => ({ ...r } as Json));
      
      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions: jsonReactions })
        .eq('id', messageId);
        
      if (error) throw error;
      return updatedReactions;
    },
    onMutate: async ({ updatedReactions }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["messages"] });
      
      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ["messages"] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            if (!page) return page;
            
            return page.map((msg: any) => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  reactions: updatedReactions,
                };
              }
              return msg;
            });
          }),
        };
      });
      
      // Return context with the previous value
      return { previousReactions: reactions };
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousReactions) {
        queryClient.setQueriesData({ queryKey: ["messages"] }, (oldData: any) => {
          if (!oldData?.pages) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              if (!page) return page;
              
              return page.map((msg: any) => {
                if (msg.id === messageId) {
                  return {
                    ...msg,
                    reactions: context.previousReactions,
                  };
                }
                return msg;
              });
            }),
          };
        });
      }
      
      toast({
        title: "Error",
        description: "Failed to remove reaction",
        variant: "destructive"
      });
    }
  });
  
  const handleRemoveReaction = async (reactionType: string) => {
    if (!user) {
      return;
    }
    
    try {
      const hasReaction = reactions.some(r => r.reaction === reactionType && r.user_id === user.id);
      if (!hasReaction) {
        return;
      }
      
      // Filter out the reaction we want to remove
      const updatedReactions = reactions.filter(r => !(r.reaction === reactionType && r.user_id === user.id));
      
      // Use the mutation to update
      await removeReactionMutation.mutateAsync({
        updatedReactions
      });
    } catch (error) {
      console.error("Error removing reaction:", error);
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
