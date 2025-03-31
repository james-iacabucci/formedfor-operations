
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

interface SculptureMainContentProps {
  sculpture: Sculpture;
  isRegenerating: boolean;
  onRegenerate: () => Promise<void>;
}

export function SculptureMainContent({ 
  sculpture, 
  isRegenerating, 
  onRegenerate 
}: SculptureMainContentProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative border rounded-lg overflow-hidden">
        <AspectRatio ratio={1}>
          <SculptureDetailImage
            sculpture={sculpture}
            isRegenerating={isRegenerating}
            onRegenerate={onRegenerate}
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

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <SculptureDescription sculpture={sculpture} />
        </TabsContent>
        <TabsContent value="files">
          <SculptureFiles sculpture={sculpture} />
        </TabsContent>
        <TabsContent value="tasks">
          <div className="border rounded-md p-4">
            <TaskList sculptureId={sculpture.id} />
          </div>
        </TabsContent>
      </Tabs>

      <ChatSheet
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        threadId={sculpture.id}
        sculptureId={sculpture.id}
      />
    </div>
  );
}
