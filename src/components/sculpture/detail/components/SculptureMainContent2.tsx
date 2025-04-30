
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { SculptureDetailImage } from "../SculptureDetailImage";
import { SculptureDescription } from "./SculptureDescription";
import { SculptureFiles } from "../SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/tasks/TaskList";
import { ChatSheet } from "@/components/chat/ChatSheet";
import { format } from "date-fns";
import { SculpturePrompt } from "../SculpturePrompt";

interface SculptureMainContent2Props {
  sculpture: Sculpture;
  isRegenerating: boolean;
  onRegenerate: () => Promise<void>;
  selectedVariantId?: string | null;
  variantImageUrl?: string | null;
  variantRenderings?: any[];
  variantDimensions?: any[];
}

export function SculptureMainContent2({ 
  sculpture, 
  isRegenerating, 
  onRegenerate,
  selectedVariantId,
  variantImageUrl,
  variantRenderings = [],
  variantDimensions = []
}: SculptureMainContent2Props) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  // Use variant image if available, otherwise fall back to sculpture image
  const displayImageUrl = variantImageUrl || sculpture.image_url || "";
  // Use thread ID based on variant if available, otherwise use sculpture ID
  const chatThreadId = selectedVariantId || sculpture.id;

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative border rounded-lg overflow-hidden">
        <AspectRatio ratio={1}>
          <SculptureDetailImage
            imageUrl={displayImageUrl}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating}
            sculptureId={sculpture.id}
            userId={sculpture.created_by}
            onRegenerate={onRegenerate}
            onManageTags={() => {
              toast({
                title: "Feature not implemented",
                description: "Tag management feature is not yet implemented.",
              });
            }}
          />
        </AspectRatio>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Discussion
        </Button>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="inline-flex h-auto bg-transparent p-1 rounded-md border border-[#333333]">
          <TabsTrigger 
            value="files"
            className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Files
          </TabsTrigger>
          <TabsTrigger 
            value="tasks"
            className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="details"
            className="h-9 px-5 py-2 text-sm font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
          >
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <SculptureFiles 
            sculptureId={sculpture.id}
            models={sculpture.models}
            renderings={variantRenderings.length > 0 ? variantRenderings : sculpture.renderings}
            dimensions={variantDimensions.length > 0 ? variantDimensions : sculpture.dimensions}
            variantId={selectedVariantId}
          />
        </TabsContent>
        <TabsContent value="tasks" className="w-full">
          <TaskList sculptureId={sculpture.id} />
        </TabsContent>
        <TabsContent value="details">
          <SculptureDescription 
            sculptureId={sculpture.id}
            imageUrl={displayImageUrl}
            description={sculpture.ai_description}
            name={sculpture.ai_generated_name}
          />

          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">AI Settings</h2>
              <SculpturePrompt prompt={sculpture.prompt} />
              <dl className="grid grid-cols-1 gap-2 text-sm mt-4">
                {sculpture.creativity_level && (
                  <div className="flex justify-between py-2 border-b">
                    <dt className="font-medium">Variation Creativity</dt>
                    <dd className="text-muted-foreground capitalize">
                      {sculpture.creativity_level}
                    </dd>
                  </div>
                )}
                <div className="flex py-2 border-b">
                  <dt className="font-medium">Created</dt>
                  <dd className="ml-4 text-muted-foreground">
                    {format(new Date(sculpture.created_at), "PPP")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ChatSheet
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        threadId={chatThreadId}
        sculptureId={sculpture.id}
        variantId={selectedVariantId}
      />
    </div>
  );
}
