
import { useState } from "react";
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
}

export function MessageItem({ message, children, onEditMessage }: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleReaction } = useMessageReactions(message);
  
  const isOwnMessage = user && user.id === message.user_id;
  const isDeleted = message.content === "[This message was deleted]";
  
  const handleEdit = () => {
    if (!isDeleted) {
      setIsEditing(true);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSaveEdit = async (content: string, attachments: any[]) => {
    try {
      const { error: messageError } = await supabase
        .from("chat_messages")
        .update({
          content: content.trim(),
          attachments: attachments,
          edited_at: new Date().toISOString()
        })
        .eq("id", message.id);

      if (messageError) throw messageError;
      
      toast({
        description: "Message updated successfully",
        duration: 2000
      });
      
      setIsEditing(false);
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
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast({
        description: "Message copied to clipboard",
        duration: 2000
      });
    }
  };
  
  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({ 
          content: "[This message was deleted]",
          attachments: []
        })
        .eq("id", message.id);
      
      if (error) {
        console.error("Error deleting message:", error);
        toast({
          title: "Error",
          description: "Failed to delete message",
          variant: "destructive"
        });
      } else {
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
          <AvatarImage src={message.profiles?.avatar_url || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <MessageHeader
            username={message.profiles?.username || "User"}
            createdAt={message.created_at}
            isHovered={isHovered}
            isOwnMessage={isOwnMessage}
            isDeleted={isDeleted}
            isEditing={isEditing}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onReaction={handleReaction}
          />
          
          <MessageContent 
            message={message}
            isDeleted={isDeleted}
            isEditing={isEditing}
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
