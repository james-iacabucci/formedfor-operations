
import { KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { UploadingFile } from "./types";
import { useUserRoles } from "@/hooks/use-user-roles";

interface MessageInputFieldProps {
  message: string;
  setMessage: (message: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  isSending: boolean;
  disabled: boolean;
  uploadingFiles: UploadingFile[];
  onFilesSelected: (files: UploadingFile[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  isQuoteChat?: boolean;
}

export function MessageInputField({
  message,
  setMessage,
  handleKeyDown,
  handlePaste,
  textareaRef,
  isSending,
  disabled,
  uploadingFiles,
  onFilesSelected,
  onSubmit,
  isQuoteChat = false
}: MessageInputFieldProps) {
  const { hasPermission } = useUserRoles();
  const hasContent = message.trim() || uploadingFiles.length > 0;
  
  // Check permissions based on chat type
  const canSendMessages = isQuoteChat 
    ? hasPermission('quote_chat.send_messages')
    : hasPermission('sculpture_chat.send_messages');
    
  const canUploadFiles = isQuoteChat
    ? hasPermission('quote_chat.upload_files')
    : hasPermission('sculpture_chat.upload_files');
  
  // If user doesn't have permission to send messages, disable the input
  if (!canSendMessages) {
    return (
      <div className="p-3 text-center text-sm text-muted-foreground bg-muted/20">
        You don't have permission to send messages in this chat.
      </div>
    );
  }
  
  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Type a message..."
        className="min-h-[44px] max-h-[200px] resize-none py-3 pr-24 text-sm overflow-y-auto"
        disabled={isSending || disabled}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {canUploadFiles && (
          <FileUpload 
            disabled={isSending || disabled}
            onFilesSelected={onFilesSelected}
          />
        )}
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full bg-primary hover:bg-primary/90"
          disabled={isSending || disabled || !hasContent}
          onClick={onSubmit}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
