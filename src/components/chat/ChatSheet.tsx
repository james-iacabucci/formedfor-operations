
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculptureId: string;
}

type ChatTopic = 'pricing' | 'fabrication' | 'operations';

export function ChatSheet({ open, onOpenChange, sculptureId }: ChatSheetProps) {
  const [threads, setThreads] = useState<Record<ChatTopic, string | null>>({
    pricing: null,
    fabrication: null,
    operations: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ChatTopic>('pricing');
  
  useEffect(() => {
    const initializeThreads = async () => {
      if (!open || !sculptureId) return;
      
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        const topics: ChatTopic[] = ['pricing', 'fabrication', 'operations'];
        const newThreads: Record<ChatTopic, string | null> = {
          pricing: null,
          fabrication: null,
          operations: null
        };
        
        for (const topic of topics) {
          // First try to find existing thread
          const { data: existing } = await supabase
            .from('chat_threads')
            .select('id')
            .eq('sculpture_id', sculptureId)
            .eq('topic', topic)
            .maybeSingle();

          if (existing) {
            // Thread exists, check if user is participant
            const { data: participant } = await supabase
              .from('chat_thread_participants')
              .select('thread_id')
              .eq('thread_id', existing.id)
              .eq('user_id', user.id)
              .maybeSingle();

            if (!participant) {
              // Add user as participant
              await supabase
                .from('chat_thread_participants')
                .insert({
                  thread_id: existing.id,
                  user_id: user.id
                });
            }
            
            newThreads[topic] = existing.id;
          } else {
            // Create new thread
            const { data: newThread, error: threadError } = await supabase
              .from('chat_threads')
              .insert({
                sculpture_id: sculptureId,
                topic: topic
              })
              .select('id')
              .single();

            if (threadError) {
              console.error(`Error creating thread for ${topic}:`, threadError);
              continue;
            }

            if (newThread) {
              // Add user as participant
              const { error: participantError } = await supabase
                .from('chat_thread_participants')
                .insert({
                  thread_id: newThread.id,
                  user_id: user.id
                });

              if (participantError) {
                console.error(`Error adding participant for ${topic}:`, participantError);
                continue;
              }

              newThreads[topic] = newThread.id;
            }
          }
        }

        setThreads(newThreads);
      } catch (error) {
        console.error('Error initializing threads:', error);
        toast({
          title: "Error",
          description: "Failed to initialize chat threads",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeThreads();
  }, [open, sculptureId, toast]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as ChatTopic)}
          className="flex flex-col h-full"
        >
          <div className="px-6 py-4 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="pricing" className="flex-1">Pricing</TabsTrigger>
              <TabsTrigger value="fabrication" className="flex-1">Fabrication</TabsTrigger>
              <TabsTrigger value="operations" className="flex-1">Operations</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <TabsContent 
                  value="pricing" 
                  className="h-full m-0 flex flex-col data-[state=active]:flex data-[state=inactive]:hidden"
                >
                  {threads.pricing && (
                    <>
                      <MessageList threadId={threads.pricing} />
                      <MessageInput threadId={threads.pricing} />
                    </>
                  )}
                </TabsContent>
                <TabsContent 
                  value="fabrication" 
                  className="h-full m-0 flex flex-col data-[state=active]:flex data-[state=inactive]:hidden"
                >
                  {threads.fabrication && (
                    <>
                      <MessageList threadId={threads.fabrication} />
                      <MessageInput threadId={threads.fabrication} />
                    </>
                  )}
                </TabsContent>
                <TabsContent 
                  value="operations" 
                  className="h-full m-0 flex flex-col data-[state=active]:flex data-[state=inactive]:hidden"
                >
                  {threads.operations && (
                    <>
                      <MessageList threadId={threads.operations} />
                      <MessageInput threadId={threads.operations} />
                    </>
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
