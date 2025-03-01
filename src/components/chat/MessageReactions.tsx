
import { useAuth } from "@/components/AuthProvider";
import { MessageReaction, FileAttachment } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, ThumbsUp, Eye, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
            const jsonAttachment: Record<string, Json> = {};
            
            // First convert to unknown, then to Record<string, Json>
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
      case "thumbs-up": return <ThumbsUp className="h-3 w-3 mr-1" />;
      case "check": return <Check className="h-3 w-3 mr-1" />;
      case "eyes": return <Eye className="h-3 w-3 mr-1" />;
      case "copy": return <Copy className="h-3 w-3 mr-1" />;
      default: return <ThumbsUp className="h-3 w-3 mr-1" />;
    }
  };
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([reactionType, reactors]) => {
        const userHasReacted = !!user && reactors.some(r => r.user_id === user.id);
        
        return (
          <Badge
            key={reactionType}
            variant={userHasReacted ? "default" : "outline"}
            className={`px-2 h-6 py-0 rounded-full text-xs flex items-center gap-1 cursor-pointer transition-colors hover:bg-muted
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
