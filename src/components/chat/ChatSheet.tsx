
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { useState } from "react";
import { UploadingFile } from "./types";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
}

export function ChatSheet({ open, onOpenChange, threadId }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col w-full sm:max-w-lg">
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList threadId={threadId} uploadingFiles={uploadingFiles} />
          <MessageInput 
            threadId={threadId} 
            autoFocus 
            onUploadingFiles={setUploadingFiles}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
