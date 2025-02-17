
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureActions } from "./SculptureActions";
import { Sculpture } from "@/types/sculpture";

interface SculptureCardActionsProps {
  sculptureId: string;
  prompt: string;
  imageUrl: string | null;
  onDelete: () => void;
  onManageTags: () => void;
}

export function SculptureCardActions({
  sculptureId,
  prompt,
  imageUrl,
  onDelete,
  onManageTags,
}: SculptureCardActionsProps) {
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
      const finalPrompt = prompt + (options.changes ? `. Changes: ${options.changes}` : "");

      if (options.regenerateImage) {
        const { error: imageError } = await supabase.functions.invoke("regenerate-image", {
          body: {
            prompt: finalPrompt,
            sculptureId: sculptureId,
            creativity: options.creativity,
            updateExisting: options.updateExisting,
            regenerateImage: true,
          },
        });

        if (imageError) throw imageError;
      }

      if (options.regenerateMetadata) {
        const { error: metadataError } = await supabase.functions.invoke("generate-metadata", {
          body: {
            prompt: finalPrompt,
            sculptureId: sculptureId,
          },
        });

        if (metadataError) throw metadataError;
      }

      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
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
    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <SculptureActions
        isRegenerating={isRegenerating}
        onManageTags={onManageTags}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
}
