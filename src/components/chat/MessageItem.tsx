
import { Check, Heart, Reply, ThumbsUp, Trash2, User, HelpCircle, Eye, FilePlus } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, FileAttachment } from "./types";
import { MessageAttachment } from "./MessageAttachment";
import { format } from "date-fns";
import { MessageReactions } from "./MessageReactions";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface MessageItemProps {
  message: Message;
  children?: React.ReactNode;
}

export function MessageItem({ message, children }: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const messageDate = new Date(message.created_at);
  const formattedDate = format(messageDate, "EEE, MMM d"); // "Wed, Mar 13" format
  const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleReply = () => {
    console.log("Reply to message:", message.id);
  };

  const handleDelete = () => {
    console.log("Delete message:", message.id);
  };
  
  const handleReaction = async (reactionType: string) => {
    if (!user) return;
    
    try {
      const existingReactions = message.reactions || [];
      
      const existingReaction = existingReactions.find(
        r => r.reaction === reactionType && r.user_id === user.id
      );
      
      let updatedReactions;
      
      if (existingReaction) {
        updatedReactions = existingReactions.filter(
          r => !(r.reaction === reactionType && r.user_id === user.id)
        );
      } else {
        const newReaction = {
          reaction: reactionType,
          user_id: user.id,
          username: user.user_metadata?.username || user.email
        };
        
        updatedReactions = [...existingReactions, newReaction];
      }
      
      // Convert attachments to Json[] for Supabase
      const attachmentsAsJson: Json[] = [];
      
      if (Array.isArray(message.attachments)) {
        for (const attachment of message.attachments) {
          if (typeof attachment === 'object' && attachment !== null) {
            const jsonAttachment: Record<string, Json> = {};
            
            // First convert to unknown, then to Record<string, Json> to avoid TypeScript error
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
        .eq("id", message.id);
      
      if (error) {
        console.error("Error adding reaction:", error);
        toast({
          title: "Error",
          description: "Failed to add reaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };
  
  const reactions = [
    { id: "thumbs-up", icon: <ThumbsUp className="h-4 w-4 text-blue-500" /> },
    { id: "check", icon: <Check className="h-4 w-4 text-green-500" /> },
    { id: "heart", icon: <Heart className="h-4 w-4 text-red-500" /> },
    { id: "eyes", icon: <Eye className="h-4 w-4 text-amber-500" /> },
    { id: "task", icon: <FilePlus className="h-4 w-4 text-purple-500" /> },
  ];

  return (
    <div className="group relative">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.profiles?.avatar_url || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm">
              {message.profiles?.username || "User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedDate} at {formattedTime}
            </span>
          </div>
          
          <div 
            className="relative w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {message.content && (
              <div className={`text-sm whitespace-pre-wrap rounded-md px-3 py-2 ${isHovered ? 'bg-accent/50' : ''} transition-colors`}>
                {message.content}
              </div>
            )}
            
            {isHovered && (
              <div className="absolute right-0 -top-8 bg-black rounded-md px-2 border border-gray-600 shadow-md flex items-center">
                {reactions.map((reaction) => {
                  const userHasReacted = !!user && (message.reactions || []).some(
                    r => r.reaction === reaction.id && r.user_id === user.id
                  );
                  
                  return (
                    <Button
                      key={reaction.id}
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 text-white hover:bg-gray-700 ${userHasReacted ? 'bg-primary/20' : ''}`}
                      onClick={() => handleReaction(reaction.id)}
                      onMouseEnter={() => setHoveredReaction(reaction.id)}
                      onMouseLeave={() => setHoveredReaction(null)}
                    >
                      {reaction.icon}
                    </Button>
                  );
                })}
                
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white hover:bg-gray-700"
                        onClick={handleReply}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reply</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {user && user.id === message.user_id && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-white hover:bg-destructive/60"
                          onClick={handleDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            )}
            
            {message.reactions && message.reactions.length > 0 && (
              <MessageReactions 
                messageId={message.id}
                reactions={message.reactions}
              />
            )}
          </div>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <MessageAttachment key={index} attachment={attachment} />
              ))}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
