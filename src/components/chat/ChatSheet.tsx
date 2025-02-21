
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
  const [threads, setThreads] = useState<Record<ChatTopic, string>>({} as Record<ChatTopic, string>);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open && sculptureId) {
      const initializeThreads = async () => {
        setIsLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.error('No authenticated user found');
            return;
          }

          const topics: ChatTopic[] = ['pricing', 'fabrication', 'operations'];
          
          for (const topic of topics) {
            console.log(`Initializing thread for topic: ${topic}`);
            
            // Check if thread exists
            const { data: existing } = await supabase
              .from('chat_threads')
              .select('id')
              .eq('sculpture_id', sculptureId)
              .eq('topic', topic)
              .single();

            if (!existing) {
              console.log(`Creating new thread for topic: ${topic}`);
              // Create new thread
              const { data: newThread, error: threadError } = await supabase
                .from('chat_threads')
                .insert({
                  sculpture_id: sculptureId,
                  topic: topic,
                })
                .select('id')
                .single();

              if (threadError) {
                console.error('Error creating thread:', threadError);
                continue;
              }

              if (newThread) {
                console.log(`Adding user as participant for new thread: ${newThread.id}`);
                // Add current user as participant
                const { error: participantError } = await supabase
                  .from('chat_thread_participants')
                  .insert({
                    thread_id: newThread.id,
                    user_id: user.id,
                  });

                if (participantError) {
                  console.error('Error adding participant:', participantError);
                  continue;
                }
                
                setThreads(prev => ({ ...prev, [topic]: newThread.id }));
              }
            } else {
              console.log(`Found existing thread: ${existing.id}`);
              // Check if user is already a participant
              const { data: existingParticipant } = await supabase
                .from('chat_thread_participants')
                .select('thread_id')
                .eq('thread_id', existing.id)
                .eq('user_id', user.id)
                .single();

              if (!existingParticipant) {
                console.log(`Adding user as participant for existing thread: ${existing.id}`);
                // Add user as participant to existing thread
                const { error: participantError } = await supabase
                  .from('chat_thread_participants')
                  .insert({
                    thread_id: existing.id,
                    user_id: user.id,
                  });

                if (participantError) {
                  console.error('Error adding participant:', participantError);
                  continue;
                }
              }

              setThreads(prev => ({ ...prev, [topic]: existing.id }));
            }
          }
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
    }
  }, [open, sculptureId, toast]);

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

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <TabsContent value="pricing" className="h-full m-0 flex flex-col">
                {threads.pricing ? (
                  <>
                    <MessageList threadId={threads.pricing} />
                    <MessageInput threadId={threads.pricing} />
                  </>
                ) : null}
              </TabsContent>
              <TabsContent value="fabrication" className="h-full m-0 flex flex-col">
                {threads.fabrication ? (
                  <>
                    <MessageList threadId={threads.fabrication} />
                    <MessageInput threadId={threads.fabrication} />
                  </>
                ) : null}
              </TabsContent>
              <TabsContent value="operations" className="h-full m-0 flex flex-col">
                {threads.operations ? (
                  <>
                    <MessageList threadId={threads.operations} />
                    <MessageInput threadId={threads.operations} />
                  </>
                ) : null}
              </TabsContent>
            </div>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
