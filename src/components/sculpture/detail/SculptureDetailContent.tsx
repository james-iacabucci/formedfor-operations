import { SculptureDetailImage } from "./SculptureDetailImage";
import { SculptureAttributes } from "./SculptureAttributes";
import { SculptureFiles } from "./SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";

interface SculptureDetailContentProps {
  sculpture: Sculpture;
  onUpdate: () => void;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureDetailContent({
  sculpture,
  onUpdate,
  originalSculpture,
  tags,
}: SculptureDetailContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { regenerateImage, isRegenerating } = useSculptureRegeneration();

  const handleRegenerate = useCallback(async () => {
    if (isRegenerating) return;
    
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
    <div className="space-y-8">
      <AspectRatio ratio={1}>
        <SculptureDetailImage
          imageUrl={sculpture.image_url}
          prompt={sculpture.prompt}
          isRegenerating={isRegenerating(sculpture.id)}
          sculptureId={sculpture.id}
          userId={sculpture.user_id}
          onRegenerate={() => handleRegenerate()}
        />
      </AspectRatio>
      <SculptureFiles
        sculptureId={sculpture.id}
        models={sculpture.models}
        renderings={sculpture.renderings}
        dimensions={sculpture.dimensions}
      />
      <SculptureAttributes
        sculpture={sculpture}
        originalSculpture={originalSculpture}
        tags={tags}
      />
    </div>
  );
}
