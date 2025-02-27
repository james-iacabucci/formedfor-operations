
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { FileList } from "./FileList";
import { UploadingFile } from "./types";

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
}

export function ChatSheet({ isOpen, onClose, threadId }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [pendingMessageSubmitted, setPendingMessageSubmitted] = useState(false);

  const handleUploadingFiles = (files: UploadingFile[], messageSubmitted: boolean) => {
    setUploadingFiles(files);
    setPendingMessageSubmitted(messageSubmitted);
  };

  if (!threadId) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md md:max-w-lg w-[90vw] p-0 flex flex-col">
        <SheetHeader className="px-4 py-2 border-b">
          <SheetTitle>Chat</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="messages" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 px-4 py-2 border-b">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 overflow-hidden">
              <MessageList 
                threadId={threadId} 
                uploadingFiles={uploadingFiles}
                pendingMessageSubmitted={pendingMessageSubmitted} 
              />
            </div>
            <MessageInput 
              threadId={threadId} 
              autoFocus 
              onUploadingFiles={handleUploadingFiles}
            />
          </TabsContent>
          
          <TabsContent value="files" className="flex-1 overflow-hidden mt-0">
            <FileList threadId={threadId} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
