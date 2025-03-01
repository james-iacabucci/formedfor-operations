
import { Check, Heart, Reply, ThumbsUp, Trash2, User, HelpCircle, Eye } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "./types";
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
    // This would be implemented later to reply to messages
    console.log("Reply to message:", message.id);
  };

  const handleDelete = () => {
    // This would be implemented later to delete messages
    console.log("Delete message:", message.id);
  };
  
  const handleReaction = async (reactionType: string) => {
    if (!user) return;
    
    try {
      const existingReactions = message.reactions || [];
      
      // Check if user already has this reaction
      const existingReaction = existingReactions.find(
        r => r.reaction === reactionType && r.user_id === user.id
      );
      
      let updatedReactions;
      
      if (existingReaction) {
        // Remove the reaction if it already exists
        updatedReactions = existingReactions.filter(
          r => !(r.reaction === reactionType && r.user_id === user.id)
        );
      } else {
        // Add the new reaction
        const newReaction = {
          reaction: reactionType,
          user_id: user.id,
          username: user.user_metadata?.username || user.email
        };
        
        updatedReactions = [...existingReactions, newReaction];
      }
      
      // Fetch the message first to get all its current data
      const { data: messageData, error: fetchError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("id", message.id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching message:", fetchError);
        return;
      }
      
      // Update message with new reactions while keeping other data
      const { error } = await supabase
        .from("chat_messages")
        .update({ 
          attachments: messageData.attachments,
          content: messageData.content,
          mentions: messageData.mentions,
          reactions: updatedReactions 
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
    { id: "thumbs-up", icon: <ThumbsUp className="h-4 w-4" /> },
    { id: "check", icon: <Check className="h-4 w-4" /> },
    { id: "question-mark", icon: <HelpCircle className="h-4 w-4" /> },
    { id: "heart", icon: <Heart className="h-4 w-4" /> },
    { id: "eyes", icon: <Eye className="h-4 w-4" /> },
  ];

  // Get colored version of icon on hover
  const getColoredIcon = (reactionId: string) => {
    switch (reactionId) {
      case "thumbs-up":
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case "check":
        return <Check className="h-4 w-4 text-green-500" />;
      case "question-mark":
        return <HelpCircle className="h-4 w-4 text-purple-500" />;
      case "heart":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "eyes":
        return <Eye className="h-4 w-4 text-amber-500" />;
      default:
        return reactions.find(r => r.id === reactionId)?.icon;
    }
  };

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
            
            {/* Slack-like action bar */}
            {isHovered && (
              <div className="absolute right-0 -top-8 bg-white rounded-md px-2 border shadow-md flex items-center">
                {reactions.map((reaction) => {
                  const userHasReacted = !!user && (message.reactions || []).some(
                    r => r.reaction === reaction.id && r.user_id === user.id
                  );
                  
                  return (
                    <Button
                      key={reaction.id}
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${userHasReacted ? 'text-primary bg-primary/10' : 'text-black'}`}
                      onClick={() => handleReaction(reaction.id)}
                      onMouseEnter={() => setHoveredReaction(reaction.id)}
                      onMouseLeave={() => setHoveredReaction(null)}
                    >
                      {hoveredReaction === reaction.id ? getColoredIcon(reaction.id) : reaction.icon}
                    </Button>
                  );
                })}
                
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-black"
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
                          className="h-8 w-8 text-black hover:bg-destructive/10"
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
