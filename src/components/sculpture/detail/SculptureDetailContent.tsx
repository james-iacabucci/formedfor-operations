
import { SculptureDetailImage } from "./SculptureDetailImage";
import { SculptureAttributes } from "./SculptureAttributes";
import { SculptureFiles } from "./SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SculptureHeader } from "./SculptureHeader";

interface SculptureDetailContentProps {
  sculpture: Sculpture;
  onUpdate: () => void;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
  onBack: () => void;
}

export function SculptureDetailContent({
  sculpture,
  onUpdate,
  originalSculpture,
  tags,
  onBack,
}: SculptureDetailContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { regenerateImage, isRegenerating } = useSculptureRegeneration();

  const handleRegenerate = useCallback(async () => {
    if (isRegenerating(sculpture.id)) return;
    
    try {
      await regenerateImage(sculpture.id);
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      
      toast({
        title: "Success",
        description: "Image regenerated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate. Please try again.",
        variant: "destructive",
      });
    }
  }, [sculpture.id, regenerateImage, queryClient, toast, isRegenerating]);

  return (
    <div>
      <div className="fixed top-[73px] left-0 right-0 bg-background z-10 pb-4 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="focus:bg-background focus:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-2xl font-bold">
              {sculpture.ai_generated_name || "Untitled Sculpture"}
            </div>
          </div>
          <SculptureHeader sculpture={sculpture} />
        </div>
      </div>

      <div className="mt-[88px] grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <AspectRatio ratio={1}>
            <SculptureDetailImage
              imageUrl={sculpture.image_url}
              prompt={sculpture.prompt}
              isRegenerating={isRegenerating(sculpture.id)}
              sculptureId={sculpture.id}
              userId={sculpture.user_id}
              onRegenerate={handleRegenerate}
              hideButtons={true}
            />
          </AspectRatio>
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              {sculpture.ai_description || "No description available"}
            </p>
          </div>
          <SculptureFiles
            sculptureId={sculpture.id}
            models={sculpture.models}
            renderings={sculpture.renderings}
            dimensions={sculpture.dimensions}
          />
        </div>
        <div>
          <SculptureAttributes
            sculpture={sculpture}
            originalSculpture={originalSculpture}
            tags={tags}
          />
        </div>
      </div>
    </div>
  );
}
