
import { useAuth } from "@/components/AuthProvider";
import { MessageReaction } from "./types";
import { Check, ThumbsUp, Eye, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const instanceId = useRef(`message-reactions-${Math.random().toString(36).substring(2, 9)}`).current;
  const renderCount = useRef(0);
  
  // Debug reactions rendering
  useEffect(() => {
    renderCount.current += 1;
    console.log(`[DEBUG][MessageReactions] Rendering reactions for message ${messageId}, instance: ${instanceId}, render #${renderCount.current}`);
    console.log(`[DEBUG][MessageReactions] Reactions count: ${reactions?.length || 0}`);
    
    if (reactions && reactions.length > 0) {
      console.log(`[DEBUG][MessageReactions] Reactions data:`, JSON.stringify(reactions));
    }
    
    return () => {
      console.log(`[DEBUG][MessageReactions] Unmounting reactions for message ${messageId}, instance: ${instanceId}`);
    };
  }, [messageId, reactions, instanceId]);
  
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
      console.log(`[DEBUG][MessageReactions] Mutation called with ${updatedReactions.length} reactions`);
      
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
      console.log(`[DEBUG][MessageReactions] Starting optimistic update with ${updatedReactions.length} reactions`);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["messages"] });
      
      // Get current cache data
      const previousData = queryClient.getQueriesData({ queryKey: ["messages"] });
      console.log(`[DEBUG][MessageReactions] Previous cache data obtained, updating...`);
      
      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ["messages"] }, (oldData: any) => {
        if (!oldData?.pages) {
          console.log(`[DEBUG][MessageReactions] No pages in cache to update`);
          return oldData;
        }
        
        console.log(`[DEBUG][MessageReactions] Updating ${oldData.pages.length} pages in cache`);
        
        const updatedData = {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            if (!page) return page;
            
            const updatedPage = page.map((msg: any) => {
              if (msg.id === messageId) {
                console.log(`[DEBUG][MessageReactions] Found message to update in cache:`, msg.id);
                console.log(`[DEBUG][MessageReactions] Before update, reactions:`, JSON.stringify(msg.reactions));
                
                // Return updated message with the new reactions
                const updatedMsg = {
                  ...msg,
                  reactions: updatedReactions,
                };
                
                console.log(`[DEBUG][MessageReactions] After update, reactions:`, JSON.stringify(updatedMsg.reactions));
                return updatedMsg;
              }
              return msg;
            });
            
            return updatedPage;
          }),
        };
        
        console.log(`[DEBUG][MessageReactions] Cache update complete`);
        return updatedData;
      });
      
      // Return context with the previous value
      return { previousReactions: reactions, previousData };
    },
    onError: (err, variables, context) => {
      console.error(`[DEBUG][MessageReactions] Mutation error:`, err);
      
      // Revert on error
      if (context?.previousData) {
        console.log(`[DEBUG][MessageReactions] Reverting to previous cache state`);
        queryClient.setQueriesData({ queryKey: ["messages"] }, context.previousData);
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
      console.log(`[DEBUG][MessageReactions] Attempting to remove reaction ${reactionType} for user ${user.id}`);
      
      const hasReaction = reactions.some(r => r.reaction === reactionType && r.user_id === user.id);
      if (!hasReaction) {
        console.log(`[DEBUG][MessageReactions] User does not have this reaction, nothing to remove`);
        return;
      }
      
      // Filter out the reaction we want to remove
      const updatedReactions = reactions.filter(r => !(r.reaction === reactionType && r.user_id === user.id));
      console.log(`[DEBUG][MessageReactions] Filtered reactions from ${reactions.length} to ${updatedReactions.length}`);
      
      // Use the mutation to update
      await removeReactionMutation.mutateAsync({
        updatedReactions
      });
      
      console.log(`[DEBUG][MessageReactions] Reaction removed successfully`);
    } catch (error) {
      console.error(`[DEBUG][MessageReactions] Error removing reaction:`, error);
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
