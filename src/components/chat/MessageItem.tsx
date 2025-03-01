
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./types";
import { MessageHeader } from "./MessageHeader";
import { MessageContent } from "./MessageContent";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { useMessageReactions } from "./hooks/useMessageReactions";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message>(message);
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleReaction } = useMessageReactions(currentMessage);
  
  const isOwnMessage = user && user.id === currentMessage.user_id;
  const isDeleted = currentMessage.content === "[This message was deleted]";
  
  // Update local message state when props change
  useEffect(() => {
    setCurrentMessage(message);
  }, [message]);
  
  const handleEdit = () => {
    if (!isDeleted) {
      setIsEditing(true);
      if (setEditingMessage) {
        setEditingMessage(currentMessage);
      }
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (setEditingMessage) {
      setEditingMessage(null);
    }
  };
  
  const handleSaveEdit = async (content: string, attachments: any[]) => {
    try {
      const { data, error: messageError } = await supabase
        .from("chat_messages")
        .update({
          content: content.trim(),
          attachments: attachments,
          edited_at: new Date().toISOString()
        })
        .eq("id", currentMessage.id)
        .select();

      if (messageError) throw messageError;
      
      // Update the local message state with the edited content and attachments
      if (data && data.length > 0) {
        const updatedMessage = {
          ...currentMessage,
          content: content.trim(),
          attachments: attachments,
          edited_at: new Date().toISOString()
        };
        setCurrentMessage(updatedMessage);
      }
      
      toast({
        description: "Message updated successfully",
        duration: 2000
      });
      
      setIsEditing(false);
      if (setEditingMessage) {
        setEditingMessage(null);
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleCopy = () => {
    if (currentMessage.content) {
      navigator.clipboard.writeText(currentMessage.content);
      toast({
        description: "Message copied to clipboard",
        duration: 2000
      });
    }
  };
  
  const confirmDelete = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .update({ 
          content: "[This message was deleted]",
          attachments: []
        })
        .eq("id", currentMessage.id)
        .select();
      
      if (error) {
        console.error("Error deleting message:", error);
        toast({
          title: "Error",
          description: "Failed to delete message",
          variant: "destructive"
        });
      } else if (data && data.length > 0) {
        // Update the local message state
        setCurrentMessage({
          ...currentMessage,
          content: "[This message was deleted]",
          attachments: []
        });
        
        toast({
          description: "Message deleted successfully",
          duration: 2000
        });
      }
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  // Check if this message is currently being edited
  const isCurrentlyEditing = isEditing || (editingMessage && editingMessage.id === currentMessage.id);

  return (
    <div 
      className="group relative py-0.5" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-start gap-3 px-6 max-w-4xl mx-auto rounded-lg p-4 ${
        isOwnMessage 
          ? 'bg-black text-white border border-muted' 
          : 'bg-accent/50'
      }`}>
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={currentMessage.profiles?.avatar_url || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
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
        </div>
      </div>
      
      <DeleteMessageDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
