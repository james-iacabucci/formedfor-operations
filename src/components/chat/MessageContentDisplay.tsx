
import { Message } from "./types";
import { MessageAttachment } from "./MessageAttachment";
import { MessageReactions } from "./MessageReactions";

interface MessageContentDisplayProps {
  message: Message;
  isDeleted: boolean;
}

export function MessageContentDisplay({ message, isDeleted }: MessageContentDisplayProps) {
  return (
    <div className="relative w-full">
      {message.content && (
        <div className={`text-sm whitespace-pre-wrap ${isDeleted ? 'italic text-muted-foreground' : ''}`}>
          {message.content}
        </div>
      )}
      
      {!isDeleted && message.attachments && message.attachments.length > 0 && (
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
  );
}
