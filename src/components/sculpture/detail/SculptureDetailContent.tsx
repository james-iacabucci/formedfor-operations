import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DeleteSculptureDialog } from "@/components/sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "@/components/tags/ManageTagsDialog";
import { SculptureImage } from "@/components/sculpture/detail/SculptureImage";
import { SculptureAttributes } from "@/components/sculpture/detail/SculptureAttributes";
import { SculptureVariations } from "@/components/sculpture/detail/SculptureVariations";
import { Sculpture } from "@/types/sculpture";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface SculptureDetailContentProps {
  sculpture: Sculpture;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureDetailContent({ 
  sculpture, 
  originalSculpture, 
  tags 
}: SculptureDetailContentProps) {
  const [sculptureToDelete, setSculptureToDelete] = useState<Sculpture | null>(null);
  const [sculptureToManageTags, setSculptureToManageTags] = useState<Sculpture | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRegenerate = async (options: {
    creativity: "none" | "small" | "medium" | "large";
    changes?: string;
    updateExisting: boolean;
    regenerateImage: boolean;
    regenerateMetadata: boolean;
  }) => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    try {
      const finalPrompt = sculpture.prompt + (options.changes ? `. Changes: ${options.changes}` : "");

      // Handle image regeneration if requested
      if (options.regenerateImage) {
        console.log("Regenerating image...");
        const { error: imageError } = await supabase.functions.invoke("regenerate-image", {
          body: {
            prompt: finalPrompt,
            sculptureId: sculpture.id,
            creativity: options.creativity,
            updateExisting: options.updateExisting,
            regenerateImage: true,
          },
        });

        if (imageError) throw imageError;
      }

      // Handle metadata regeneration if requested
      if (options.regenerateMetadata) {
        console.log("Regenerating metadata...");
        const { error: metadataError } = await supabase.functions.invoke("generate-metadata", {
          body: {
            prompt: finalPrompt,
            sculptureId: sculpture.id,
          },
        });

        if (metadataError) throw metadataError;
      }

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });

      toast({
        title: "Success",
        description: options.updateExisting 
          ? "Updates to the existing sculpture generated successfully."
          : "New variation generated successfully.",
      });
    } catch (error) {
      console.error("Error regenerating:", error);
      toast({
        title: "Error",
        description: "Failed to generate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2">
        <SculptureImage
          imageUrl={sculpture.image_url}
          prompt={sculpture.prompt}
          isRegenerating={isRegenerating}
          onDelete={() => setSculptureToDelete(sculpture)}
          onDownload={async () => {
            try {
              const response = await fetch(sculpture.image_url);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `sculpture-${sculpture.id}.png`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (error) {
              console.error("Error downloading image:", error);
              toast({
                title: "Error",
                description: "Failed to download image. Please try again.",
                variant: "destructive",
              });
            }
          }}
          onManageTags={() => setSculptureToManageTags(sculpture)}
          onRegenerate={handleRegenerate}
        />
        
        <SculptureVariations sculptureId={sculpture.id} />
      </div>

      <div className="col-span-1">
        <SculptureAttributes
          sculpture={sculpture}
          originalSculpture={originalSculpture}
          tags={tags}
        />
      </div>

      <DeleteSculptureDialog
        sculpture={sculptureToDelete}
        open={!!sculptureToDelete}
        onOpenChange={(open) => !open && setSculptureToDelete(null)}
      />

      <ManageTagsDialog
        sculpture={sculptureToManageTags}
        open={!!sculptureToManageTags}
        onOpenChange={(open) => !open && setSculptureToManageTags(null)}
      />
    </div>
  );
}
