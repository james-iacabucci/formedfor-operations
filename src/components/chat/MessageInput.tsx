
import { useState, KeyboardEvent } from "react";
import { UploadingFile } from "./types";
import { PendingFiles } from "./PendingFiles";
import { MessageInputField } from "./MessageInputField";
import { useTextareaAutosize } from "./hooks/useTextareaAutosize";
import { useMessageSend } from "./hooks/useMessageSend";
import { usePasteHandler } from "./hooks/usePasteHandler";

interface MessageInputProps {
  threadId: string;
  autoFocus?: boolean;
  onUploadingFiles: (files: UploadingFile[]) => void;
  uploadingFiles: UploadingFile[];
  onUploadComplete: (fileIds: string[]) => void;
  disabled?: boolean;
}

export function MessageInput({ 
  threadId, 
  autoFocus = false, 
  onUploadingFiles,
  uploadingFiles,
  onUploadComplete,
  disabled = false
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { textareaRef, adjustHeight } = useTextareaAutosize(message);

  // Focus the textarea when the component mounts if autoFocus is true
  useState(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  });

  const resetTextarea = () => setMessage("");

  const { handleSubmit, isSending } = useMessageSend({
    threadId,
    onUploadingFiles,
    uploadingFiles,
    onUploadComplete,
    resetTextarea,
    adjustHeight,
    textareaRef
  });

  const { handlePaste } = usePasteHandler({ onUploadingFiles });

  const handleFilesSelected = (files: UploadingFile[]) => {
    onUploadingFiles(files);
  };

  const handleRemovePendingFile = (id: string) => {
    onUploadingFiles(uploadingFiles.filter(f => f.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
    else if (e.key === "Escape") {
      e.preventDefault();
      setMessage("");
      onUploadComplete(uploadingFiles.map(f => f.id));
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        requestAnimationFrame(() => {
          adjustHeight();
        });
      }
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-4 bg-background space-y-2">      
      <MessageInputField
        message={message}
        setMessage={setMessage}
        handleKeyDown={handleKeyDown}
        handlePaste={handlePaste}
        textareaRef={textareaRef}
        isSending={isSending}
        disabled={disabled}
        uploadingFiles={uploadingFiles}
        onFilesSelected={handleFilesSelected}
        onSubmit={handleFormSubmit}
      />
      
      <PendingFiles 
        files={uploadingFiles}
        isSending={isSending}
        onRemove={handleRemovePendingFile}
      />
    </form>
  );
}
