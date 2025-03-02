
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Edit, Trash2, Copy, MoreHorizontal, MessageSquareText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageItemActions } from "./MessageItemActions";

interface MessageHeaderProps {
  username: string;
  createdAt: string;
  avatarUrl?: string | null;
  isHovered: boolean;
  isOwnMessage: boolean;
  isEditing: boolean;
  isDeleted: boolean;
  editedAt: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onReaction: (reactionType: string) => void;
  onReply?: () => void;
}

export function MessageHeader({
  username,
  createdAt,
  avatarUrl,
  isHovered,
  isOwnMessage,
  isEditing,
  isDeleted,
  editedAt,
  onEdit,
  onDelete,
  onCopy,
  onReaction,
  onReply
}: MessageHeaderProps) {
  // Parse timestamp into a Date object
  const messageDate = new Date(createdAt);
  const formattedTimeAgo = formatDistanceToNow(messageDate, { addSuffix: true });
  const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Format edited timestamp if it exists
  const editedTimeString = editedAt ? `(edited ${formatDistanceToNow(new Date(editedAt), { addSuffix: true })})` : '';
  
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="text-xs">
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex items-baseline gap-1.5">
          <span className="font-medium text-sm">
            {username}
          </span>
          
          <span className="text-xs text-muted-foreground">
            {formattedTime} {editedTimeString}
          </span>
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
        />
      )}
    </div>
  );
}
