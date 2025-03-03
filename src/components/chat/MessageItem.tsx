
import { useAuth } from "@/components/AuthProvider";
import { Message } from "./types";
import { MessageHeader } from "./MessageHeader";
import { MessageContent } from "./MessageContent";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { useMessageReactions } from "./hooks/useMessageReactions";
import { useMessageItem } from "./hooks/useMessageItem";
import { MessageContainer } from "./MessageContainer";
import { MessageReactions } from "./MessageReactions";
import { useEffect, useRef, useState } from "react";
import { CreateTaskSheet } from "../tasks/CreateTaskSheet";

interface MessageItemProps {
  message: Message;
  children?: React.ReactNode;
  onEditMessage?: (message: Message) => void;
  editingMessage?: Message | null;
  setEditingMessage?: (message: Message | null) => void;
  onReplyToMessage?: (message: Message) => void;
  sculptureId?: string;
}

export function MessageItem({ 
  message, 
  children, 
  onEditMessage,
  editingMessage,
  setEditingMessage,
  onReplyToMessage,
  sculptureId
}: MessageItemProps) {
  const { user } = useAuth();
  const { handleReaction } = useMessageReactions(message);
  const instanceId = useRef(`message-item-${Math.random().toString(36).substring(2, 9)}`).current;
  const renderCount = useRef(0);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  
  const {
    isHovered,
    setIsHovered,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditing,
    currentMessage,
    isDeleted,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleCopy,
    confirmDelete
  } = useMessageItem(message, setEditingMessage);
  
  const isOwnMessage = user && user.id === currentMessage.user_id;
  
  // Check if this message is currently being edited
  const isCurrentlyEditing = isEditing || (editingMessage && editingMessage.id === currentMessage.id);

  // Handle reply to message
  const handleReply = () => {
    if (onReplyToMessage) {
      onReplyToMessage(currentMessage);
    }
  };

  // Handle create task from message
  const handleCreateTask = () => {
    if (!isDeleted && sculptureId) {
      setIsCreateTaskOpen(true);
    }
  };

  // Debug message rendering
  useEffect(() => {
    renderCount.current += 1;
    console.log(`[DEBUG][MessageItem] Rendering message ${message.id}, instance: ${instanceId}, render #${renderCount.current}`);
    console.log(`[DEBUG][MessageItem] Message ${message.id} has ${message.reactions?.length || 0} reactions on render`);
    
    if (message.reactions && message.reactions.length > 0) {
      console.log(`[DEBUG][MessageItem] Reactions:`, JSON.stringify(message.reactions));
    }
    
    return () => {
      console.log(`[DEBUG][MessageItem] Unmounting message ${message.id}, instance: ${instanceId}`);
    };
  }, [message, instanceId]);

  // Debug when reactions change
  useEffect(() => {
    if (message.reactions) {
      console.log(`[DEBUG][MessageItem] Reactions changed for message ${message.id}, new count: ${message.reactions.length}`);
    }
  }, [message.reactions, message.id]);

  return (
    <>
      <MessageContainer
        message={currentMessage}
        isOwnMessage={isOwnMessage}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <MessageHeader
          username={currentMessage.profiles?.username || "User"}
          createdAt={currentMessage.created_at}
          isHovered={isHovered}
          isOwnMessage={isOwnMessage}
          isDeleted={isDeleted}
          isEditing={isCurrentlyEditing}
          editedAt={currentMessage.edited_at}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onReaction={handleReaction}
          onReply={handleReply}
          onCreateTask={handleCreateTask}
          sculptureId={sculptureId}
        />
        
        <MessageContent 
          message={currentMessage}
          isDeleted={isDeleted}
          isEditing={isCurrentlyEditing}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />

        {/* Display message reactions */}
        {currentMessage.reactions && currentMessage.reactions.length > 0 && (
          <MessageReactions 
            messageId={currentMessage.id} 
            reactions={currentMessage.reactions} 
          />
        )}

        {children}
      </MessageContainer>
      
      <DeleteMessageDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Create Task Sheet */}
      {sculptureId && (
        <CreateTaskSheet
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          sculptureId={sculptureId}
          relatedType="sculpture"
          initialDescription={!isDeleted ? currentMessage.content : ""}
        />
      )}
    </>
  );
}
