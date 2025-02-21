
import { useState, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

type ChatTopic = 'pricing' | 'fabrication' | 'operations';

export function ChatSheet({ open, onOpenChange, sculptureId }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [currentTopic, setCurrentTopic] = useState<ChatTopic>('fabrication');
  const hasUnreadMessages = false;

  const getThreadId = (topic: ChatTopic) => {
    return `${sculptureId}-${topic}`;
  };

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
        <Tabs defaultValue="fabrication" value={currentTopic} onValueChange={(value) => setCurrentTopic(value as ChatTopic)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="fabrication">Fabrication</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>
          <div className="flex flex-col h-[calc(100vh-12rem)] mt-4">
            <TabsContent value="pricing" className="flex-1 flex flex-col">
              <MessageList threadId={getThreadId('pricing')} uploadingFiles={uploadingFiles} />
              <MessageInput threadId={getThreadId('pricing')} autoFocus onUploadProgress={setUploadingFiles} />
            </TabsContent>
            <TabsContent value="fabrication" className="flex-1 flex flex-col">
              <MessageList threadId={getThreadId('fabrication')} uploadingFiles={uploadingFiles} />
              <MessageInput threadId={getThreadId('fabrication')} autoFocus onUploadProgress={setUploadingFiles} />
            </TabsContent>
            <TabsContent value="operations" className="flex-1 flex flex-col">
              <MessageList threadId={getThreadId('operations')} uploadingFiles={uploadingFiles} />
              <MessageInput threadId={getThreadId('operations')} autoFocus onUploadProgress={setUploadingFiles} />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
