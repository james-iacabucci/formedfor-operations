
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAIGeneration } from "@/hooks/use-ai-generation";

export function useSculptureRegeneration() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { generateAIContent } = useAIGeneration();

  const regenerateImage = async (sculptureId: string) => {
    console.log("useSculptureRegeneration: regenerateImage called for sculptureId:", sculptureId);
    
    if (!sculptureId) {
      console.error("Invalid sculpture data: missing sculptureId");
      toast({
        title: "Error",
        description: "Invalid sculpture data",
        variant: "destructive",
      });
      return;
    }

    if (isRegenerating) {
      console.log("Already regenerating, skipping");
      return;
    }

    console.log("Starting regeneration process...");
    setIsRegenerating(true);
    
    try {
      console.log("Calling regenerate-image edge function");
      const { data, error } = await supabase.functions.invoke('regenerate-image', {
        body: { sculptureId }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('Edge function response indicates failure:', data);
        throw new Error(data?.message || 'Failed to regenerate image');
      }

      console.log("Successfully received new image URL:", data.imageUrl);

      // Get the new image
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'regenerated-image.png', { type: 'image/png' });

      console.log("Starting AI content generation");
      // Generate new AI content
      let aiName = '';
      let aiDescription = '';

      await generateAIContent('name', file, '', (name) => {
        console.log("Generated AI name:", name);
        aiName = name;
      });

      await generateAIContent('description', file, aiName, (description) => {
        console.log("Generated AI description:", description);
        aiDescription = description;
      });

      console.log("Updating sculpture with new AI content");
      // Update the sculpture with new AI content
      const { error: updateError } = await supabase
        .from('sculptures')
        .update({
          ai_generated_name: aiName,
          ai_description: aiDescription
        })
        .eq('id', sculptureId);

      if (updateError) {
        console.error('Error updating AI content:', updateError);
        throw updateError;
      }

      console.log("Regeneration process completed successfully");
      toast({
        title: "Success",
        description: "Your sculpture has been updated with a new image and AI-generated content.",
      });

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
    } catch (error) {
      console.error('Error in regeneration process:', error);
      toast({
        title: "Error",
        description: error.message || "Could not regenerate image. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      console.log("Setting isRegenerating to false");
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
    console.log("generateVariant called with options:", options);
    if (isRegenerating) {
      console.log("Already regenerating, skipping variant generation");
      return;
    }

    setIsRegenerating(true);
    try {
      if (options.updateExisting) {
        console.log("Updating existing sculpture");
        const { error: updateError } = await supabase
          .from('sculptures')
          .update({
            prompt: options.changes ? `${prompt}\n\nChanges: ${options.changes}` : prompt,
            creativity_level: options.creativity
          })
          .eq('id', sculptureId);

        if (updateError) throw updateError;

        if (options.regenerateImage) {
          console.log("Regenerating image for existing sculpture");
          await regenerateImage(sculptureId);
        }

      } else {
        console.log("Creating new variant");
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
          console.log("Generating image for new variant");
          const { error: generateError } = await supabase.functions.invoke('generate-image', {
            body: { 
              prompt: options.changes ? `${prompt}\n\nChanges: ${options.changes}` : prompt,
              sculptureId: variant.id 
            }
          });

          if (generateError) throw generateError;
        }
      }

      console.log("Variant generation completed successfully");
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
      throw error;
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
