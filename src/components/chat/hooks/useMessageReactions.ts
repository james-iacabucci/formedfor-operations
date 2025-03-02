
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageReaction } from "../types";
import { Json } from "@/integrations/supabase/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMessageReactions(message: Message) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const reactionMutation = useMutation({
    mutationFn: async ({ 
      messageId, 
      reactionType, 
      updatedReactions 
    }: { 
      messageId: string; 
      reactionType: string; 
      updatedReactions: MessageReaction[] 
    }) => {
      // Convert MessageReaction[] to Json[] for database
      const jsonReactions = updatedReactions.map(r => ({ ...r } as Json));
      
      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions: jsonReactions })
        .eq('id', messageId);
        
      if (error) throw error;
      return updatedReactions;
    },
    onMutate: async ({ messageId, reactionType, updatedReactions }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
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
                // Return updated message with the new reactions
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
      return { previousReactions: message.reactions };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context we returned above
      if (context?.previousReactions) {
        queryClient.setQueriesData({ queryKey: ["messages"] }, (oldData: any) => {
          if (!oldData?.pages) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              if (!page) return page;
              
              return page.map((msg: any) => {
                if (msg.id === variables.messageId) {
                  // Revert to previous reactions
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
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  });
  
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
      
      // Use the mutation to update the reaction and handle cache updates
      await reactionMutation.mutateAsync({
        messageId: message.id,
        reactionType,
        updatedReactions
      });
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Reaction error:", error);
    }
  };
  
  return { handleReaction };
}
