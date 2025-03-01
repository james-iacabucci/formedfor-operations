
import { Edit, Reply, Trash2, User, Copy, ThumbsUp, Eye, Check } from "lucide-react";
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
  const messageDate = new Date(message.created_at);
  const formattedDate = format(messageDate, "EEE, MMM d"); // "Wed, Mar 13" format
  const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isOwnMessage = user && user.id === message.user_id;
  
  const handleReply = () => {
    console.log("Reply to message:", message.id);
  };

  const handleDelete = () => {
    console.log("Delete message:", message.id);
  };
  
  const handleEdit = () => {
    console.log("Edit message:", message.id);
  };
  
  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast({
        description: "Message copied to clipboard",
        duration: 2000
      });
    }
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
            
            // Convert to unknown first, then to Record<string, Json>
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

  return (
    <div 
      className="group relative py-1" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-start gap-3 px-6 max-w-4xl mx-auto rounded-lg p-4 ${isOwnMessage ? 'bg-primary/5' : 'bg-accent/50'}`}>
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
            
            <div className={`flex items-center ml-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <TooltipProvider delayDuration={300}>
                {isOwnMessage ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={handleEdit}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-destructive/10"
                          onClick={handleDelete}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleReaction("thumbs-up")}
                        >
                          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Like</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleReaction("eyes")}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Seen</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleReaction("check")}
                        >
                          <Check className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Done</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={handleCopy}
                        >
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </TooltipProvider>
            </div>
          </div>
          
          <div className="relative w-full">
            {message.content && (
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>
            )}
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {message.attachments.map((attachment, index) => (
                  <MessageAttachment key={index} attachment={attachment} />
                ))}
              </div>
            )}
            
            {message.reactions && message.reactions.length > 0 && (
              <MessageReactions 
                messageId={message.id}
                reactions={message.reactions}
              />
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
