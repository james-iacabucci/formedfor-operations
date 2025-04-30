
import { useEffect, useState } from "react";
import { useMessages } from "./hooks/useMessages";
import { useMessageSend } from "./hooks/useMessageSend";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./components/ChatHeader";
import { FileList } from "./file-list/FileList";
import { ChatContent } from "./components/ChatContent";
import { ChatNavigation } from "./components/ChatNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const {
    messages,
    error,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isDeleting,
    handleDeleteMessage,
    handleEditMessage
  } = useMessages(threadId);

  const {
    handleSendMessage,
    uploadingFiles,
    setUploadingFiles,
    isSending
  } = useMessageSend(threadId, sculptureId, variantId);

  // Reset to messages tab when thread changes
  useEffect(() => {
    setActiveTab("messages");
  }, [threadId]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        threadId={threadId} 
        sculptureId={sculptureId}
        isQuote={isQuote}
      />
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "messages" | "files")}>
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="messages" className="data-[state=active]:bg-transparent">Messages</TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-transparent">Files</TabsTrigger>
          </TabsList>
        </div>

        <ChatContent>
          <TabsContent value="messages" className="flex-grow mt-0 flex flex-col h-full">
            <ChatNavigation
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
            
            <MessageList
              messages={messages}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              isError={isError}
              error={error}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              isDeleting={isDeleting}
            />
            
            <MessageInput
              onSendMessage={handleSendMessage}
              uploadingFiles={uploadingFiles}
              setUploadingFiles={setUploadingFiles}
              isSending={isSending}
              isQuote={isQuote}
            />
          </TabsContent>
          
          <TabsContent value="files" className="flex-grow mt-0 overflow-hidden">
            <FileList threadId={threadId} sculptureId={sculptureId} />
          </TabsContent>
        </ChatContent>
      </Tabs>
    </div>
  );
}
