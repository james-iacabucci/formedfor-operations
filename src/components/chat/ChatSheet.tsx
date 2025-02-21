
import { useState, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  type: string;
  size: number;
}

interface ChatSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sculptureId?: string;
}

export function ChatSheet({ open, onOpenChange, sculptureId }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const threadId = sculptureId || "default-thread"; // Use sculptureId as threadId if provided
  const hasUnreadMessages = false;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <MessageSquare className="h-4 w-4" />
          {hasUnreadMessages && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Chat</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          <MessageList threadId={threadId} uploadingFiles={uploadingFiles} />
          <MessageInput 
            threadId={threadId} 
            autoFocus
            onUploadProgress={setUploadingFiles} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
