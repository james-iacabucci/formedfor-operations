
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { Message, UploadingFile } from "./types";
import { useThreads } from "./hooks/useThreads";
import { ChatHeader } from "./components/ChatHeader";
import { ChatContent } from "./components/ChatContent";
import { MessageInput } from "./MessageInput";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  quoteMode?: boolean;
}

export function ChatSheet({ open, onOpenChange, threadId, quoteMode = false }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeView, setActiveView] = useState<"chat" | "files">("chat");
  const [currentTopic, setCurrentTopic] = useState<"pricing" | "fabrication" | "operations" | "general">(quoteMode ? "general" : "pricing");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [resetScroll, setResetScroll] = useState(0); // Used to trigger scroll reset

  // Get threads data using custom hook
  const { threads } = useThreads(threadId, quoteMode);

  const handleViewChange = (value: "chat" | "files") => {
    setActiveView(value);
  };

  const handleTopicChange = (value: "pricing" | "fabrication" | "operations" | "general") => {
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
  const currentThreadId = threads?.find(thread => 
    quoteMode ? thread.id === threadId : thread.topic === currentTopic
  )?.id;

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
          
          {/* Topics navigation - only show for sculpture chat (not in quote mode) */}
          {!quoteMode && (
            <div className="border-b shrink-0 py-3 px-4">
              <Tabs
                value={currentTopic}
                onValueChange={handleTopicChange}
                className="rounded-full border border-[#333333] p-1 flex w-full"
              >
                <TabsList className="bg-transparent border-0 h-9 p-0 w-full flex">
                  <TabsTrigger 
                    value="pricing" 
                    className="h-9 px-5 py-2 text-sm font-medium rounded-full text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
                  >
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="fabrication" 
                    className="h-9 px-5 py-2 text-sm font-medium rounded-full text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
                  >
                    Fabrication
                  </TabsTrigger>
                  <TabsTrigger 
                    value="operations" 
                    className="h-9 px-5 py-2 text-sm font-medium rounded-full text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200 flex-1"
                  >
                    Operations
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

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
