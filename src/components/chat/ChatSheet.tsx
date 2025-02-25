
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { useState } from "react";
import { UploadingFile } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileList } from "./FileList";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
}

export function ChatSheet({ open, onOpenChange, threadId }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "files">("chat");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col w-full sm:max-w-lg">
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "chat" | "files")}
            className="flex flex-col flex-1"
          >
            <div className="px-4 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="files" className="flex-1">
                  Files
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
              <MessageList threadId={threadId} uploadingFiles={uploadingFiles} />
              <MessageInput 
                threadId={threadId} 
                autoFocus 
                onUploadingFiles={setUploadingFiles}
              />
            </TabsContent>

            <TabsContent value="files" className="flex-1 mt-0 p-4 overflow-auto">
              <FileList threadId={threadId} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
