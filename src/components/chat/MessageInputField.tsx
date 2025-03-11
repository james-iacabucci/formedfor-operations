
import { KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { UploadingFile } from "./types";

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
  onSubmit
}: MessageInputFieldProps) {
  const hasContent = message.trim() || uploadingFiles.length > 0;
  
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
        <FileUpload 
          disabled={isSending || disabled}
          onFilesSelected={onFilesSelected}
        />
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
