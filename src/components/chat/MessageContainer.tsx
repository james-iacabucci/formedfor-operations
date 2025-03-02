
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Message } from "./types";

interface MessageContainerProps {
  message: Message;
  isOwnMessage: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
}

export function MessageContainer({ 
  message, 
  isOwnMessage, 
  onMouseEnter, 
  onMouseLeave, 
  children 
}: MessageContainerProps) {
  return (
    <div 
      className="group relative py-0.5 px-3" 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`flex items-start gap-3 max-w-4xl mx-auto rounded-lg p-4 ${
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
          {children}
        </div>
      </div>
    </div>
  );
}
