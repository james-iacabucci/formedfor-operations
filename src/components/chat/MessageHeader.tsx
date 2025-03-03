
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageItemActions } from "./MessageItemActions";

interface MessageHeaderProps {
  username: string;
  createdAt: string;
  isHovered: boolean;
  isOwnMessage: boolean;
  isDeleted: boolean;
  isEditing: boolean;
  editedAt?: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onReaction: (reactionType: string) => void;
  onReply?: () => void;
  onCreateTask?: () => void;
  sculptureId?: string;
}

export function MessageHeader({
  username,
  createdAt,
  isHovered,
  isOwnMessage,
  isDeleted,
  isEditing,
  editedAt,
  onEdit,
  onDelete,
  onCopy,
  onReaction,
  onReply,
  onCreateTask,
  sculptureId
}: MessageHeaderProps) {
  const formattedDate = new Date(createdAt).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex items-center justify-between mb-1 relative">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm">{username}</span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
          {editedAt && (
            <span className="text-xs italic text-muted-foreground ml-1">(edited)</span>
          )}
        </div>
      </div>
      
      {!isEditing && (
        <MessageItemActions
          isHovered={isHovered}
          isOwnMessage={isOwnMessage}
          isDeleted={isDeleted}
          handleEdit={onEdit}
          handleDelete={onDelete}
          handleCopy={onCopy}
          handleReaction={onReaction}
          handleReply={onReply}
          handleCreateTask={onCreateTask}
          sculptureId={sculptureId}
        />
      )}
    </div>
  );
}
