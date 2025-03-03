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
  return (
    <div className="flex items-center justify-between mb-1 relative">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm">{username}</span>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <span>
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {editedAt && (
              <>
                <span>•</span>
                <span className="italic">Edited</span>
              </>
            )}
          </div>
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
