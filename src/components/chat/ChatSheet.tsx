
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { useState } from "react";
import { UploadingFile } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileList } from "./FileList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, MessageSquare, Wrench } from "lucide-react";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
}

export function ChatSheet({ open, onOpenChange, threadId }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeView, setActiveView] = useState<"chat" | "files">("chat");
  const [currentTopic, setCurrentTopic] = useState<"pricing" | "fabrication" | "operations">("pricing");

  const { data: threads } = useQuery({
    queryKey: ["chat-threads", threadId],
    queryFn: async () => {
      console.log('Fetching threads for sculpture:', threadId);
      const { data, error } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("sculpture_id", threadId);

      if (error) {
        console.error("Error fetching threads:", error);
        return [];
      }

      console.log('Fetched threads:', data);
      return data || [];
    },
  });

  const currentThreadId = threads?.find(thread => thread.topic === currentTopic)?.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-lg h-[100dvh]">
        <div className="flex flex-col h-full overflow-hidden">
          <Tabs
            value={currentTopic}
            onValueChange={(value) => setCurrentTopic(value as "pricing" | "fabrication" | "operations")}
            className="w-full border-b shrink-0"
          >
            <div className="px-4 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="pricing" className="flex-1">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Pricing</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="fabrication" className="flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Fabrication</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="operations" className="flex-1">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>Operations</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          <Tabs
            value={activeView}
            onValueChange={(value) => setActiveView(value as "chat" | "files")}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-4 pt-4 shrink-0">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="files" className="flex-1">
                  Files
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex flex-col flex-1 m-0 p-0 data-[state=active]:flex overflow-hidden">
              {currentThreadId && (
                <>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <MessageList threadId={currentThreadId} uploadingFiles={uploadingFiles} />
                  </div>
                  <div className="shrink-0 p-4 pt-2">
                    <MessageInput 
                      threadId={currentThreadId} 
                      autoFocus 
                      onUploadingFiles={setUploadingFiles}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="files" className="flex-1 m-0 p-4 overflow-auto">
              {currentThreadId && <FileList threadId={currentThreadId} />}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
