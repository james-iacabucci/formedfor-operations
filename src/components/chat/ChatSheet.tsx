
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { Message, UploadingFile } from "./types";
import { useThreads } from "./hooks/useThreads";
import { ChatHeader } from "./components/ChatHeader";
import { ChatContent } from "./components/ChatContent";
import { MessageInput } from "./MessageInput";
import { useUserRoles } from "@/hooks/use-user-roles";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  quoteMode?: boolean;
  sculptureId?: string;
}

export function ChatSheet({ 
  open, 
  onOpenChange, 
  threadId, 
  quoteMode = false,
  sculptureId 
}: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeView, setActiveView] = useState<"chat" | "files">("chat");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [resetScroll, setResetScroll] = useState(0);
  const { hasPermission } = useUserRoles();

  // Check permissions based on chat type
  const canViewChat = quoteMode 
    ? hasPermission('quote_chat.view')
    : hasPermission('sculpture_chat.view');

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
    ? threadId 
    : threads?.[0]?.id; // For sculpture chat, use the first thread

  // If user doesn't have permission to view this chat, show an access denied message
  if (!canViewChat) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col p-6 w-full sm:max-w-lg h-[100dvh]">
          <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-center text-muted-foreground">
              You don't have permission to view this chat.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-lg h-[100dvh]">
        <div className="flex flex-col h-full">
          <ChatHeader 
            threadId={currentThreadId || threadId} 
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
            sculptureId={sculptureId}
          />
          
          {activeView === "chat" && currentThreadId && (
            <div className="border-t">
              <MessageInput 
                threadId={currentThreadId}
                onUploadingFiles={handleFilesSelected}
                uploadingFiles={uploadingFiles}
                onUploadComplete={handleUploadComplete}
                disabled={!!editingMessage}
                isQuoteChat={quoteMode}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
