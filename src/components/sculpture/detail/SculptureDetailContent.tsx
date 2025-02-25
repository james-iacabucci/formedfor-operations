
import { SculptureDetailImage } from "./SculptureDetailImage";
import { SculptureAttributes } from "./SculptureAttributes";
import { SculptureFiles } from "./SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, RefreshCw } from "lucide-react";
import { SculptureHeader } from "./SculptureHeader";
import { RegenerationSheet } from "../RegenerationSheet";
import { Link } from "react-router-dom";
import { EditableField } from "./EditableField";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { supabase } from "@/integrations/supabase/client";

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
  const { regenerateImage, isRegenerating, generateVariant } = useSculptureRegeneration();
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const { generateAIContent, isGeneratingDescription } = useAIGeneration();

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
    console.log("Manage tags clicked");
    toast({
      title: "Coming Soon",
      description: "Tag management will be available soon.",
    });
  };

  const handleRegenerateDescription = async () => {
    if (!sculpture.image_url) return;
    
    try {
      const response = await fetch(sculpture.image_url);
      const blob = await response.blob();
      const file = new File([blob], "sculpture.png", { type: "image/png" });
      
      generateAIContent(
        "description",
        file,
        sculpture.ai_generated_name || "",
        async (newDescription: string) => {
          const { error } = await supabase
            .from("sculptures")
            .update({ ai_description: newDescription })
            .eq("id", sculpture.id);
          
          if (error) throw error;
          
          await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
          toast({
            title: "Success",
            description: "Description regenerated successfully.",
          });
        }
      );
    } catch (error) {
      console.error("Error regenerating description:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate description. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-background z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant="outline"
                size="icon"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
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
            <div className="group relative">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRegenerateDescription}
                  disabled={isGeneratingDescription}
                >
                  <RefreshCw className={`h-4 w-4 ${isGeneratingDescription ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => document.querySelector<HTMLElement>('[data-field="ai_description"]')?.click()}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <EditableField
                value={sculpture.ai_description || "No description available"}
                type="textarea"
                sculptureId={sculpture.id}
                field="ai_description"
                className="text-muted-foreground"
                hideControls
              />
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
