
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { GeneratedImage } from "@/components/sculpture/create/GeneratedSculptureGrid";

export function useSculptureGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImages = async (
    prompt: string,
    creativity: string,
    generatedImages: GeneratedImage[],
    selectedIds: Set<string>,
    setGeneratedImages: (images: GeneratedImage[]) => void,
    clearSelection: () => void
  ) => {
    setIsGenerating(true);
    const numImages = 6;
    const newImages: GeneratedImage[] = [];

    if (generatedImages.length > 0) {
      generatedImages.forEach(img => {
        if (selectedIds.has(img.id)) {
          newImages.push(img);
        } else {
          newImages.push({
            id: crypto.randomUUID(),
            url: null,
            isGenerating: true,
            prompt: prompt.trim()
          });
        }
      });
    } else {
      for (let i = 0; i < numImages; i++) {
        newImages.push({
          id: crypto.randomUUID(),
          url: null,
          isGenerating: true,
          prompt: prompt.trim()
        });
      }
      clearSelection();
    }

    setGeneratedImages(newImages);

    try {
      const imagesToGenerate = newImages.filter(img => img.isGenerating);
      
      const generationPromises = imagesToGenerate.map(image =>
        supabase.functions.invoke('generate-image', {
          body: { 
            prompt: prompt.trim(),
            sculptureId: image.id,
            creativity 
          }
        }).then(({ data, error }) => {
          if (error) throw error;
          if (!data?.imageUrl) throw new Error('No image URL in response');
          
          const updatedImages = generatedImages.map(img => 
            img.id === image.id 
              ? { ...img, url: data.imageUrl, isGenerating: false }
              : img
          );
          
          setGeneratedImages(updatedImages);
          
          return { id: image.id, success: true };
        }).catch(error => {
          console.error('Error generating image:', error);
          
          const updatedImages = generatedImages.map(img => 
            img.id === image.id 
              ? { ...img, isGenerating: false, error: true }
              : img
          );
          
          setGeneratedImages(updatedImages);
          
          return { id: image.id, success: false };
        })
      );

      const results = await Promise.all(generationPromises);
      
      const failedCount = results.filter(r => !r.success).length;
      if (failedCount > 0) {
        toast({
          title: "Generation Completed",
          description: `${failedCount} out of ${results.length} images failed to generate.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in generation process:', error);
      toast({
        title: "Error",
        description: "Could not generate images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateImages
  };
}
