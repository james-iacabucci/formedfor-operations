
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SculptureDetailImage } from "../SculptureDetailImage";
import { SculptureDescription } from "./SculptureDescription";
import { SculptureFiles } from "../SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/tasks/TaskList";

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
  const { toast } = useToast();

  const handleManageTags = () => {
    console.log("Manage tags clicked");
    toast({
      title: "Coming Soon",
      description: "Tag management will be available soon.",
    });
  };

  return (
    <div className="space-y-8">
      <AspectRatio ratio={1}>
        <SculptureDetailImage
          imageUrl={sculpture.image_url}
          prompt={sculpture.prompt}
          isRegenerating={isRegenerating}
          sculptureId={sculpture.id}
          userId={sculpture.created_by}
          onRegenerate={onRegenerate}
          hideButtons={false}
          status={sculpture.status}
          onManageTags={handleManageTags}
        />
      </AspectRatio>
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <SculptureDescription
            sculptureId={sculpture.id}
            imageUrl={sculpture.image_url}
            description={sculpture.ai_description}
            name={sculpture.ai_generated_name}
          />
          <SculptureFiles
            sculptureId={sculpture.id}
            models={sculpture.models}
            renderings={sculpture.renderings}
            dimensions={sculpture.dimensions}
          />
        </TabsContent>
        <TabsContent value="tasks">
          <TaskList sculptureId={sculpture.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
