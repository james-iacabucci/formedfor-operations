import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MessageSquare, Files } from "lucide-react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { FileList } from "./FileList";
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
type ViewMode = 'messages' | 'files';

export function ChatSheet({ open, onOpenChange, sculptureId }: ChatSheetProps) {
  const [threads, setThreads] = useState<Record<ChatTopic, string | null>>({
    pricing: null,
    fabrication: null,
    operations: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ChatTopic>('pricing');
  const [viewMode, setViewMode] = useState<ViewMode>('messages');

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
          console.log(`Initializing thread for topic: ${topic}`);
          
          const { data: existing, error: findError } = await supabase
            .from('chat_threads')
            .select('id')
            .eq('sculpture_id', sculptureId)
            .eq('topic', topic)
            .maybeSingle();

          if (findError) {
            console.error(`Error finding thread for ${topic}:`, findError);
            continue;
          }

          let threadId: string;

          if (existing) {
            console.log(`Found existing thread for ${topic}:`, existing.id);
            threadId = existing.id;
          } else {
            console.log(`Creating new thread for ${topic}`);
            const { data: newThread, error: createError } = await supabase
              .from('chat_threads')
              .insert({
                sculpture_id: sculptureId,
                topic: topic
              })
              .select('id')
              .single();

            if (createError) {
              console.error(`Error creating thread for ${topic}:`, createError);
              continue;
            }

            if (!newThread) {
              console.error(`Failed to create thread for ${topic}`);
              continue;
            }

            threadId = newThread.id;
            console.log(`Created new thread for ${topic}:`, threadId);
          }

          const { data: existingParticipant } = await supabase
            .from('chat_thread_participants')
            .select('thread_id')
            .eq('thread_id', threadId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (!existingParticipant) {
            console.log(`Adding user as participant to thread ${threadId}`);
            const { error: participantError } = await supabase
              .from('chat_thread_participants')
              .insert({
                thread_id: threadId,
                user_id: user.id
              });

            if (participantError) {
              console.error(`Error adding participant for ${topic}:`, participantError);
              continue;
            }
          }

          newThreads[topic] = threadId;
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
          <div className="px-6 py-4 border-b bg-muted/30">
            <div className="flex items-center justify-between gap-4">
              <TabsList className="w-full">
                <TabsTrigger value="pricing" className="flex-1">Pricing</TabsTrigger>
                <TabsTrigger value="fabrication" className="flex-1">Fabrication</TabsTrigger>
                <TabsTrigger value="operations" className="flex-1">Operations</TabsTrigger>
              </TabsList>

              <ToggleGroup 
                type="single" 
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value as ViewMode)}
                className="bg-muted p-1 rounded-md"
              >
                <ToggleGroupItem value="messages" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="files" size="sm">
                  <Files className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-background">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                {Object.entries(threads).map(([topic, threadId]) => (
                  <TabsContent 
                    key={topic}
                    value={topic} 
                    className="h-full m-0 flex flex-col data-[state=active]:flex data-[state=inactive]:hidden"
                  >
                    {threadId ? (
                      viewMode === 'messages' ? (
                        <>
                          <MessageList threadId={threadId} />
                          <MessageInput threadId={threadId} autoFocus={open} />
                        </>
                      ) : (
                        <FileList threadId={sculptureId} />
                      )
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>Failed to load chat</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </>
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
