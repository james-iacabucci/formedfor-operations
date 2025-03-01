
import { useState, useEffect } from "react";
import { Message } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useMessageItem(message: Message, setEditingMessage?: (message: Message | null) => void) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message>(message);
  const { toast } = useToast();
  
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

  return {
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
  };
}
