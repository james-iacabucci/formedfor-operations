
import { useAuth } from "@/components/AuthProvider";
import { Message } from "./types";
import { MessageHeader } from "./MessageHeader";
import { MessageContent } from "./MessageContent";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { useMessageReactions } from "./hooks/useMessageReactions";
import { useMessageItem } from "./hooks/useMessageItem";
import { MessageContainer } from "./MessageContainer";

interface MessageItemProps {
  message: Message;
  children?: React.ReactNode;
  onEditMessage?: (message: Message) => void;
  editingMessage?: Message | null;
  setEditingMessage?: (message: Message | null) => void;
}

export function MessageItem({ 
  message, 
  children, 
  onEditMessage,
  editingMessage,
  setEditingMessage
}: MessageItemProps) {
  const { user } = useAuth();
  const { handleReaction } = useMessageReactions(message);
  
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onReaction={handleReaction}
        />
        
        <MessageContent 
          message={currentMessage}
          isDeleted={isDeleted}
          isEditing={isCurrentlyEditing}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />

        {children}
      </MessageContainer>
      
      <DeleteMessageDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
