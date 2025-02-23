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
import { useState } from "react";
import { RegenerationSheet } from "../RegenerationSheet";

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
  const { regenerateImage, isRegenerating, generateVariant } = useSculptureRegeneration();
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);

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

  const handleGenerateVariant = async (options: {
    creativity: "none" | "small" | "medium" | "large";
    changes?: string;
    updateExisting: boolean;
    regenerateImage: boolean;
    regenerateMetadata: boolean;
  }) => {
    try {
      await generateVariant(sculpture.id, sculpture.user_id, sculpture.prompt, options);
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      
      toast({
        title: "Success",
        description: options.updateExisting 
          ? "Updates generated successfully." 
          : "Variation created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate variant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageTags = () => {
    // This will be implemented when we add tag management functionality
    console.log("Manage tags clicked");
    toast({
      title: "Coming Soon",
      description: "Tag management will be available soon.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-background z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
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

      <div className="overflow-y-auto flex-1 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <AspectRatio ratio={1}>
              <SculptureDetailImage
                imageUrl={sculpture.image_url}
                prompt={sculpture.prompt}
                isRegenerating={isRegenerating(sculpture.id)}
                sculptureId={sculpture.id}
                userId={sculpture.user_id}
                onRegenerate={handleRegenerate}
                hideButtons={false}
                status={sculpture.status}
                onManageTags={handleManageTags}
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

      <RegenerationSheet
        open={isRegenerationSheetOpen}
        onOpenChange={setIsRegenerationSheetOpen}
        onRegenerate={handleGenerateVariant}
        isRegenerating={isRegenerating(sculpture.id)}
        defaultPrompt={sculpture.prompt}
      />
    </div>
  );
}
