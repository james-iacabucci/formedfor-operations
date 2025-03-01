
import { Reply, Trash2, User } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "./types";
import { MessageAttachment } from "./MessageAttachment";
import { format } from "date-fns";
import { MessageReactions } from "./MessageReactions";
import { MessageReactionPicker } from "./MessageReactionPicker";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";

interface MessageItemProps {
  message: Message;
  children?: React.ReactNode;
}

export function MessageItem({ message, children }: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const messageDate = new Date(message.created_at);
  const formattedDate = format(messageDate, "EEE, MMM d"); // "Wed, Mar 13" format
  const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const { user } = useAuth();
  
  const handleReply = () => {
    // This would be implemented later to reply to messages
    console.log("Reply to message:", message.id);
    // Close the emoji picker after action
    setShowReactionPicker(false);
  };

  const handleDelete = () => {
    // This would be implemented later to delete messages
    console.log("Delete message:", message.id);
    // Close the emoji picker after action
    setShowReactionPicker(false);
  };
  
  return (
    <div className="group relative">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
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
          
          <div className="relative">
            {message.content && (
              <div 
                className="text-sm whitespace-pre-wrap rounded-lg group"
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setShowReactionPicker(false)}
              >
                {message.content}
                
                {showReactionPicker && (
                  <div 
                    className="absolute left-0 top-0 -translate-y-full transform"
                    onMouseEnter={() => setShowReactionPicker(true)}
                    onMouseLeave={() => setShowReactionPicker(false)}
                  >
                    <div className="flex items-center bg-background rounded-lg border shadow-md p-1 mb-2">
                      <MessageReactionPicker 
                        messageId={message.id}
                        existingReactions={message.reactions || []}
                        onClose={() => setShowReactionPicker(false)}
                      />
                      
                      <div className="border-l border-border ml-1 pl-1 flex items-center gap-1">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={handleReply}
                              >
                                <Reply className="h-4 w-4" />
                                <span className="sr-only">Reply</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reply</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {user && user.id === message.user_id && (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={handleDelete}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
