
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { useState, useEffect } from "react";
import { UploadingFile } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileList } from "./FileList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, MessageSquare, Wrench, Files } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
}

export function ChatSheet({ open, onOpenChange, threadId }: ChatSheetProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeView, setActiveView] = useState<"chat" | "files">("chat");
  const [currentTopic, setCurrentTopic] = useState<"pricing" | "fabrication" | "operations">("pricing");
  const { user } = useAuth();
  const [sculptureName, setSculptureName] = useState<string>("");

  const { data: threads, refetch } = useQuery({
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

  useEffect(() => {
    const fetchSculptureName = async () => {
      if (!threadId) return;
      
      const { data, error } = await supabase
        .from("chat_threads")
        .select("sculptures(ai_generated_name, manual_name)")
        .eq("sculpture_id", threadId)
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching sculpture name:", error);
        return;
      }
      
      if (data?.sculptures) {
        const name = data.sculptures.manual_name || data.sculptures.ai_generated_name || "Untitled Sculpture";
        setSculptureName(name);
      }
    };
    
    fetchSculptureName();
  }, [threadId]);

  useEffect(() => {
    const createDefaultThreads = async () => {
      if (!threads || !user) return;

      const topics: ("pricing" | "fabrication" | "operations")[] = ["pricing", "fabrication", "operations"];
      const missingTopics = topics.filter(topic => 
        !threads.some(thread => thread.topic === topic)
      );

      if (missingTopics.length > 0) {
        console.log('Creating default threads for topics:', missingTopics);
        
        for (const topic of missingTopics) {
          const { error } = await supabase
            .from("chat_threads")
            .insert({
              sculpture_id: threadId,
              topic: topic,
              user_id: user.id
            });

          if (error) {
            console.error(`Error creating thread for ${topic}:`, error);
          }
        }

        refetch();
      }
    };

    createDefaultThreads();
  }, [threads, threadId, user, refetch]);

  const currentThreadId = threads?.find(thread => thread.topic === currentTopic)?.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-lg h-[100dvh]">
        <div className="flex flex-col h-full">
          <div className="border-b shrink-0 py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="font-medium truncate">{sculptureName}</div>
            </div>
          </div>
          
          <div className="border-b shrink-0 pb-4">
            <div className="flex items-start px-4 pt-4 flex-wrap gap-2">
              <div className="w-full flex justify-between items-center">
                <Tabs
                  value={activeView}
                  onValueChange={(value) => setActiveView(value as "chat" | "files")}
                  className="bg-black p-1.5 rounded-md border border-muted"
                >
                  <TabsList className="bg-transparent border-0 h-7 p-0">
                    <TabsTrigger 
                      value="chat" 
                      className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-white"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger 
                      value="files" 
                      className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-white"
                    >
                      <Files className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Tabs
                  value={currentTopic}
                  onValueChange={(value) => setCurrentTopic(value as "pricing" | "fabrication" | "operations")}
                  className="bg-black p-1.5 rounded-md border border-muted"
                >
                  <TabsList className="bg-transparent border-0 h-7 p-0">
                    <TabsTrigger 
                      value="pricing" 
                      className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>Pricing</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="fabrication" 
                      className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>Fabrication</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="operations" 
                      className="text-xs uppercase font-medium rounded-sm text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        <span>Operations</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeView === "chat" ? (
                <>
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
                </>
              ) : (
                <>
                  {currentThreadId && (
                    <FileList threadId={currentThreadId} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
