
import { format } from "date-fns";
import { MessageItemActions } from "./MessageItemActions";

interface MessageHeaderProps {
  username: string;
  createdAt: string;
  isHovered: boolean;
  isOwnMessage: boolean;
  isDeleted: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onReaction: (reactionType: string) => void;
}

export function MessageHeader({
  username,
  createdAt,
  isHovered,
  isOwnMessage,
  isDeleted,
  onEdit,
  onDelete,
  onCopy,
  onReaction
}: MessageHeaderProps) {
  const messageDate = new Date(createdAt);
  const formattedDate = format(messageDate, "EEE, MMM d"); // "Wed, Mar 13" format
  const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">
          {username || "User"}
        </span>
        <span className="text-xs text-muted-foreground">
          {formattedDate} at {formattedTime}
        </span>
      </div>
      
      <MessageItemActions 
        isHovered={isHovered}
        isOwnMessage={isOwnMessage}
        isDeleted={isDeleted}
        handleEdit={onEdit}
        handleDelete={onDelete}
        handleCopy={onCopy}
        handleReaction={onReaction}
      />
    </div>
  );
}
