
import { User } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "./types";
import { MessageAttachment } from "./MessageAttachment";
import { format } from "date-fns";
import { MessageReactions } from "./MessageReactions";
import { MessageReactionPicker } from "./MessageReactionPicker";
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";

interface MessageItemProps {
  message: Message;
  children?: React.ReactNode;
}

export function MessageItem({ message, children }: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const messageDate = new Date(message.created_at);
  const formattedDate = format(messageDate, "EEE, MMM d"); // "Wed, Mar 13" format
  const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
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
                  <div className="absolute top-0 right-0 -translate-y-full">
                    <HoverCard openDelay={0} closeDelay={300}>
                      <HoverCardTrigger asChild>
                        <button 
                          className="p-1 rounded-full bg-muted hover:bg-muted/80"
                          aria-label="Add reaction"
                        >
                          <span className="text-sm">😀</span>
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="p-0 w-auto" side="top" align="end">
                        <MessageReactionPicker 
                          messageId={message.id}
                          existingReactions={message.reactions || []}
                          onClose={() => setShowReactionPicker(false)}
                        />
                      </HoverCardContent>
                    </HoverCard>
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
