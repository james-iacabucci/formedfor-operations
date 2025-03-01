
import { useAuth } from "@/components/AuthProvider";
import { MessageReaction, FileAttachment, isFileAttachment } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Heart, ThumbsUp, HelpCircle, Eye, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Json } from "@/integrations/supabase/types";

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
      
      const { data: message, error: fetchError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("id", messageId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching message:", fetchError);
        return;
      }
      
      // Convert attachments to Json[] for Supabase
      const attachmentsAsJson: Json[] = [];
      
      if (Array.isArray(message.attachments)) {
        for (const attachment of message.attachments) {
          if (typeof attachment === 'object' && attachment !== null) {
            // Create a new object with only the properties we need
            const jsonAttachment: Record<string, Json> = {};
            
            // Safely add properties with proper type checking
            if ('name' in attachment && typeof attachment.name === 'string') {
              jsonAttachment.name = attachment.name;
            } else {
              jsonAttachment.name = "";
            }
            
            if ('url' in attachment && typeof attachment.url === 'string') {
              jsonAttachment.url = attachment.url;
            } else {
              jsonAttachment.url = "";
            }
            
            if ('type' in attachment && typeof attachment.type === 'string') {
              jsonAttachment.type = attachment.type;
            } else {
              jsonAttachment.type = "";
            }
            
            if ('size' in attachment && typeof attachment.size === 'number') {
              jsonAttachment.size = attachment.size;
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
  
  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case "thumbs-up": return <ThumbsUp className="h-3 w-3 text-blue-500" />;
      case "check": return <Check className="h-3 w-3 text-green-500" />;
      case "heart": return <Heart className="h-3 w-3 text-red-500" />;
      case "eyes": return <Eye className="h-3 w-3 text-amber-500" />;
      case "task": return <FilePlus className="h-3 w-3 text-purple-500" />;
      case "strong": return <span className="text-xs">💪</span>;
      case "thank-you": return <span className="text-xs">🙏</span>;
      case "agree": return <span className="text-xs">💯</span>;
      case "question-mark": return <HelpCircle className="h-3 w-3 text-purple-500" />;
      default: return <ThumbsUp className="h-3 w-3 text-blue-500" />;
    }
  };
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([reactionType, reactors]) => {
        const userHasReacted = !!user && reactors.some(r => r.user_id === user.id);
        
        return (
          <Button
            key={reactionType}
            variant="outline"
            size="sm"
            className={`h-6 py-0 px-1.5 rounded-full text-xs flex items-center gap-1
              ${userHasReacted ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted hover:bg-muted/80'}`}
            onClick={() => userHasReacted && handleRemoveReaction(reactionType)}
            title={reactors.map(r => r.username || "User").join(", ")}
          >
            <span>{getReactionIcon(reactionType)}</span>
            <span>{reactors.length}</span>
          </Button>
        );
      })}
    </div>
  );
}
