
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId: string;
}

type ChatTopic = 'pricing' | 'fabrication' | 'operations';

export function ChatSheet({ open, onOpenChange, sculptureId }: ChatSheetProps) {
  const [threads, setThreads] = useState<Record<ChatTopic, string>>({} as Record<ChatTopic, string>);
  
  useEffect(() => {
    if (open && sculptureId) {
      const initializeThreads = async () => {
        // Create threads if they don't exist
        const topics: ChatTopic[] = ['pricing', 'fabrication', 'operations'];
        for (const topic of topics) {
          const { data: existing } = await supabase
            .from('chat_threads')
            .select('id')
            .eq('sculpture_id', sculptureId)
            .eq('topic', topic)
            .single();

          if (!existing) {
            const { data: newThread } = await supabase
              .from('chat_threads')
              .insert({
                sculpture_id: sculptureId,
                topic: topic as ChatTopic,
              })
              .select('id')
              .single();

            if (newThread) {
              const user = await supabase.auth.getUser();
              // Add current user as participant
              await supabase
                .from('chat_thread_participants')
                .insert({
                  thread_id: newThread.id,
                  user_id: user.data.user?.id,
                });
              
              setThreads(prev => ({ ...prev, [topic]: newThread.id }));
            }
          } else {
            setThreads(prev => ({ ...prev, [topic]: existing.id }));
          }
        }
      };

      initializeThreads();
    }
  }, [open, sculptureId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <Tabs defaultValue="pricing" className="flex flex-col h-full">
          <div className="px-6 py-4 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="pricing" className="flex-1">Pricing</TabsTrigger>
              <TabsTrigger value="fabrication" className="flex-1">Fabrication</TabsTrigger>
              <TabsTrigger value="operations" className="flex-1">Operations</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="pricing" className="h-full m-0">
              {threads.pricing && (
                <div className="flex flex-col h-full">
                  <MessageList threadId={threads.pricing} />
                  <MessageInput threadId={threads.pricing} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="fabrication" className="h-full m-0">
              {threads.fabrication && (
                <div className="flex flex-col h-full">
                  <MessageList threadId={threads.fabrication} />
                  <MessageInput threadId={threads.fabrication} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="operations" className="h-full m-0">
              {threads.operations && (
                <div className="flex flex-col h-full">
                  <MessageList threadId={threads.operations} />
                  <MessageInput threadId={threads.operations} />
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
