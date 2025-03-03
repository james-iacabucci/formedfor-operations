
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { Message, UploadingFile } from "./types";
import { useThreads } from "./hooks/useThreads";
import { ChatHeader } from "./components/ChatHeader";
import { ChatNavigation } from "./components/ChatNavigation";
import { ChatContent } from "./components/ChatContent";
import { MessageInput } from "./MessageInput";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
}

export function ChatSheet({ open, onOpenChange, threadId }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeView, setActiveView] = useState<"chat" | "files">("chat");
  const [currentTopic, setCurrentTopic] = useState<"pricing" | "fabrication" | "operations">("pricing");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [resetScroll, setResetScroll] = useState(0); // Used to trigger scroll reset

  // Get threads data using custom hook
  const { threads } = useThreads(threadId);

  const handleViewChange = (value: "chat" | "files") => {
    setActiveView(value);
  };

  const handleTopicChange = (value: "pricing" | "fabrication" | "operations") => {
    setCurrentTopic(value);
    // Trigger scroll reset when changing topics
    setResetScroll(prev => prev + 1);
  };

  const handleFilesSelected = (files: UploadingFile[]) => {
    setUploadingFiles(prev => [...prev, ...files]);
  };

  const handleUploadComplete = (fileIds: string[]) => {
    setUploadingFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
  };

  // Find the current thread ID based on the selected topic
  const currentThreadId = threads?.find(thread => thread.topic === currentTopic)?.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-lg h-[100dvh]">
        <div className="flex flex-col h-full">
          <ChatHeader threadId={threadId} />
          
          <ChatNavigation 
            activeView={activeView}
            onViewChange={handleViewChange}
            currentTopic={currentTopic}
            onTopicChange={handleTopicChange}
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
