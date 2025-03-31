
import { useState, KeyboardEvent } from "react";
import { UploadingFile } from "./types";
import { PendingFiles } from "./PendingFiles";
import { MessageInputField } from "./MessageInputField";
import { useTextareaAutosize } from "./hooks/useTextareaAutosize";
import { useMessageSend } from "./hooks/useMessageSend";
import { usePasteHandler } from "./hooks/usePasteHandler";
import { useUserRoles } from "@/hooks/use-user-roles";

interface MessageInputProps {
  threadId: string;
  onUploadingFiles: (files: UploadingFile[]) => void;
  uploadingFiles: UploadingFile[];
  onUploadComplete: (fileIds: string[]) => void;
  disabled?: boolean;
  isQuoteChat?: boolean;
  sculptureId?: string;
}

export function MessageInput({
  threadId,
  onUploadingFiles,
  uploadingFiles,
  onUploadComplete,
  disabled = false,
  isQuoteChat = false,
  sculptureId
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { textareaRef, adjustHeight } = useTextareaAutosize(message);
  const { hasPermission } = useUserRoles();

  // Check permissions based on chat type
  const canSendMessage = isQuoteChat
    ? hasPermission('quote_chat.send')
    : hasPermission('sculpture_chat.send');

  const { handleSubmit, isSending } = useMessageSend({
    threadId,
    onUploadingFiles,
    uploadingFiles,
    onUploadComplete,
    resetTextarea: () => setMessage(""),
    adjustHeight,
    textareaRef,
    sculptureId
  });

  const { handlePaste } = usePasteHandler({
    onUploadingFiles
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit(e as any, message);
      setMessage("");
    }
  };

  // Don't render the input if user doesn't have permission to send messages
  if (!canSendMessage) {
    return (
      <div className="p-4 text-center text-muted-foreground border-t">
        You don't have permission to send messages in this chat.
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-4">
      {uploadingFiles.length > 0 && (
        <PendingFiles 
          files={uploadingFiles} 
          isSending={isSending}
          onRemove={(id) => {
            onUploadingFiles(uploadingFiles.filter(f => f.id !== id));
          }} 
        />
      )}
      
      <form 
        onSubmit={(e) => {
          handleSubmit(e, message);
          setMessage("");
        }}
        className="flex flex-col space-y-2"
      >
        <MessageInputField
          message={message}
          setMessage={setMessage}
          handleKeyDown={handleKeyDown}
          handlePaste={handlePaste}
          textareaRef={textareaRef}
          isSending={isSending}
          disabled={disabled || isSending}
          uploadingFiles={uploadingFiles}
          onFilesSelected={onUploadingFiles}
          onSubmit={(e) => {
            handleSubmit(e, message);
            setMessage("");
          }}
          isQuoteChat={isQuoteChat}
        />
      </form>
    </div>
  );
}
