
import { SculptureDetailImage } from "./SculptureDetailImage";
import { SculptureAttributes } from "./SculptureAttributes";
import { SculptureFiles } from "./SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { supabase } from "@/integrations/supabase/client";

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { regenerateImage } = useSculptureRegeneration();

  const handleRegenerate = async () => {
    console.log("Starting regeneration...");
    setIsRegenerating(true);
    console.log("isRegenerating set to:", true);
    try {
      await regenerateImage(sculpture.id);
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      toast({
        title: "Success",
        description: "Image regenerated successfully.",
      });
    } catch (error) {
      console.error("Error regenerating:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("Regeneration complete, setting isRegenerating to false");
      setIsRegenerating(false);
    }
  };

  console.log("SculptureDetailContent rendering, isRegenerating:", isRegenerating);

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
