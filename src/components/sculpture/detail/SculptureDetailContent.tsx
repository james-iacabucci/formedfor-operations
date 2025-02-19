
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
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureDetailContent({
  sculpture,
  originalSculpture,
  tags,
}: SculptureDetailContentProps) {
  console.log("SculptureDetailContent: Initial render");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { regenerateImage, isRegenerating } = useSculptureRegeneration();

  const handleRegenerate = useCallback(async () => {
    console.log("SculptureDetailContent: handleRegenerate called");
    if (isRegenerating) return; // Prevent multiple regenerations
    
    try {
      console.log("Starting regeneration process...");
      await regenerateImage(sculpture.id);
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      console.log("Regeneration completed successfully");
      
      toast({
        title: "Success",
        description: "Image regenerated successfully.",
      });
    } catch (error) {
      console.error("Regeneration error:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate. Please try again.",
        variant: "destructive",
      });
    }
  }, [sculpture.id, regenerateImage, queryClient, toast, isRegenerating]);

  console.log("SculptureDetailContent: Current isRegenerating state:", isRegenerating);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="w-full space-y-6">
        <AspectRatio ratio={1}>
          <SculptureDetailImage
            imageUrl={sculpture.image_url || ""}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating}
            sculptureId={sculpture.id}
            userId={sculpture.user_id}
            onRegenerate={handleRegenerate}
          />
        </AspectRatio>
        <SculptureFiles
          sculptureId={sculpture.id}
          models={sculpture.models}
          renderings={sculpture.renderings}
          dimensions={sculpture.dimensions}
        />
      </div>
      <SculptureAttributes
        sculpture={sculpture}
        originalSculpture={originalSculpture}
        tags={tags}
      />
    </div>
  );
}
