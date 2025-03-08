
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { Message, UploadingFile } from "./types";
import { useThreads } from "./hooks/useThreads";
import { ChatHeader } from "./components/ChatHeader";
import { ChatContent } from "./components/ChatContent";
import { MessageInput } from "./MessageInput";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  quoteMode?: boolean;
}

export function ChatSheet({ open, onOpenChange, threadId, quoteMode = false }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeView, setActiveView] = useState<"chat" | "files">("chat");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [resetScroll, setResetScroll] = useState(0); // Used to trigger scroll reset

  // Get threads data using custom hook
  const { threads } = useThreads(threadId, quoteMode);

  const handleViewChange = (value: "chat" | "files") => {
    setActiveView(value);
  };

  const handleFilesSelected = (files: UploadingFile[]) => {
    setUploadingFiles(prev => [...prev, ...files]);
  };

  const handleUploadComplete = (fileIds: string[]) => {
    setUploadingFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
  };

  // Find the current thread ID
  const currentThreadId = quoteMode 
    ? threads?.find(thread => thread.id === threadId)?.id
    : threads?.[0]?.id; // For general chat, just use the first thread

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-lg h-[100dvh]">
        <div className="flex flex-col h-full">
          <ChatHeader 
            threadId={threadId} 
            activeView={activeView}
            onViewChange={handleViewChange}
            onClose={() => onOpenChange(false)}
            quoteMode={quoteMode}
          />
          
          <ChatContent 
            activeView={activeView}
            currentThreadId={currentThreadId}
            resetScroll={resetScroll}
            uploadingFiles={uploadingFiles}
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
          />
          
          {activeView === "chat" && currentThreadId && (
            <div className="border-t">
              <MessageInput 
                threadId={currentThreadId}
                onUploadingFiles={handleFilesSelected}
                uploadingFiles={uploadingFiles}
                onUploadComplete={handleUploadComplete}
                disabled={!!editingMessage}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
