
import { useEffect, useState } from "react";
import { useMessages } from "./hooks/useMessages";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./components/ChatHeader";
import { FileList } from "./file-list/FileList";
import { ChatContent } from "./components/ChatContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadingFile } from "./types";
import { Message } from "./types";

interface ChatThreadProps {
  threadId: string;
  sculptureId: string;
  isQuote?: boolean;
  variantId?: string | null;
}

export function ChatThread({ 
  threadId, 
  sculptureId, 
  isQuote = false,
  variantId
}: ChatThreadProps) {
  const [activeTab, setActiveTab] = useState<"messages" | "files">("messages");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [resetScrollKey, setResetScrollKey] = useState(0);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useMessages(threadId);

  // Reset to messages tab when thread changes
  useEffect(() => {
    setActiveTab("messages");
    setResetScrollKey(prev => prev + 1); // Force MessageList to remount when thread changes
  }, [threadId]);

  const handleUploadComplete = (fileIds: string[]) => {
    setUploadingFiles(current => current.filter(f => !fileIds.includes(f.id)));
  };

  const handleUploadingFilesChange = (files: UploadingFile[]) => {
    setUploadingFiles(files);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        threadId={threadId} 
        activeView={activeTab}
        onViewChange={setActiveTab}
        onClose={() => {}} // We don't need to close in this context
        sculptureId={sculptureId}
        quoteMode={isQuote}
      />
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "messages" | "files")}>
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="messages" className="data-[state=active]:bg-transparent">Messages</TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-transparent">Files</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-grow flex flex-col h-full">
          <TabsContent value="messages" className="flex-grow mt-0 flex flex-col h-full">
            <MessageList 
              threadId={threadId}
              uploadingFiles={uploadingFiles}
              key={`${threadId}-${resetScrollKey}`}
              editingMessage={editingMessage}
              setEditingMessage={setEditingMessage}
              sculptureId={sculptureId}
            />
            
            <MessageInput 
              threadId={threadId}
              onUploadingFiles={handleUploadingFilesChange}
              uploadingFiles={uploadingFiles}
              onUploadComplete={handleUploadComplete}
              isQuoteChat={isQuote}
              sculptureId={sculptureId}
            />
          </TabsContent>
          
          <TabsContent value="files" className="flex-grow mt-0 overflow-hidden">
            <FileList threadId={threadId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
