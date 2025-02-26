
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, MessageSquare, Wrench } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { FileList } from "@/components/chat/FileList";
import { UploadingFile } from "@/components/chat/types";

interface ChatDetailProps {
  sculptureId: string;
}

export function ChatDetail({ sculptureId }: ChatDetailProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeView, setActiveView] = useState<"chat" | "files">("chat");
  const [currentTopic, setCurrentTopic] = useState<"pricing" | "fabrication" | "operations">("pricing");

  const { data: threads } = useQuery({
    queryKey: ["chat-threads", sculptureId],
    queryFn: async () => {
      console.log('Fetching threads for sculpture:', sculptureId);
      const { data, error } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("sculpture_id", sculptureId);

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
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      <Tabs
        value={currentTopic}
        onValueChange={(value) => setCurrentTopic(value as "pricing" | "fabrication" | "operations")}
        className="w-full border-b shrink-0"
      >
        <div className="px-4 pt-2">
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
        <div className="px-4 pt-2 shrink-0">
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1">
              Chat
            </TabsTrigger>
            <TabsTrigger value="files" className="flex-1">
              Files
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent 
          value="chat" 
          className="flex-1 flex flex-col m-0 p-0 data-[state=active]:flex overflow-hidden"
        >
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

        <TabsContent 
          value="files" 
          className="flex-1 flex flex-col m-0 overflow-hidden"
        >
          {currentThreadId && (
            <FileList threadId={currentThreadId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
