
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSculptureRegeneration() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const regenerateImage = async (sculptureId: string) => {
    if (!sculptureId) {
      toast({
        title: "Error",
        description: "Invalid sculpture data",
        variant: "destructive",
      });
      return;
    }

    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-image', {
        body: { sculptureId }
      });

      if (error) {
        console.error('Error regenerating image:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to regenerate image');
      }

      toast({
        title: "Success",
        description: "Your sculpture image is being regenerated.",
      });

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast({
        title: "Error",
        description: error.message || "Could not regenerate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const generateVariant = async (
    sculptureId: string,
    userId: string,
    prompt: string,
    options: {
      creativity: "none" | "small" | "medium" | "large";
      changes?: string;
      updateExisting: boolean;
      regenerateImage: boolean;
      regenerateMetadata: boolean;
    }
  ) => {
    setIsRegenerating(true);
    try {
      if (options.updateExisting) {
        const { error: updateError } = await supabase
          .from('sculptures')
          .update({
            prompt: options.changes ? `${prompt}\n\nChanges: ${options.changes}` : prompt,
            creativity_level: options.creativity
          })
          .eq('id', sculptureId);

        if (updateError) throw updateError;

        if (options.regenerateImage) {
          const { error } = await supabase.functions.invoke('regenerate-image', {
            body: { sculptureId }
          });

          if (error) throw error;
        }

      } else {
        const { data: variant, error } = await supabase
          .from('sculptures')
          .insert([
            {
              prompt: options.changes ? `${prompt}\n\nChanges: ${options.changes}` : prompt,
              user_id: userId,
              ai_engine: "runware",
              status: "idea",
              original_sculpture_id: sculptureId,
              creativity_level: options.creativity
            }
          ])
          .select()
          .single();

        if (error) throw error;

        if (options.regenerateImage) {
          const { error: generateError } = await supabase.functions.invoke('generate-image', {
            body: { 
              prompt: options.changes ? `${prompt}\n\nChanges: ${options.changes}` : prompt,
              sculptureId: variant.id 
            }
          });

          if (generateError) throw generateError;
        }
      }

      toast({
        title: options.updateExisting ? "Updating sculpture" : "Generating variant",
        description: options.updateExisting 
          ? "Your sculpture is being updated."
          : "Your sculpture variant is being generated.",
      });

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
    } catch (error) {
      console.error('Error generating variant:', error);
      toast({
        title: "Error",
        description: "Could not generate variant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    isRegenerating,
    regenerateImage,
    generateVariant
  };
}
