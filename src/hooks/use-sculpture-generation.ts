
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { GeneratedImage } from "@/components/sculpture/create/GeneratedSculptureGrid";

// Define types for our image generation results
interface GenerationResult {
  id: string;
  success: boolean;
  url?: string;
  error?: boolean;
}

export function useSculptureGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImages = async (
    prompt: string,
    creativity: string,
    generatedImages: GeneratedImage[],
    selectedIds: Set<string>,
    setGeneratedImages: React.Dispatch<React.SetStateAction<GeneratedImage[]>>,
    clearSelection: () => void
  ) => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt before generating.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Starting image generation with prompt:", prompt);
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
      console.log("Images to generate:", imagesToGenerate.length);
      
      if (imagesToGenerate.length === 0) {
        setIsGenerating(false);
        return;
      }
      
      // Create generation promises
      const generationPromises = imagesToGenerate.map(async (image) => {
        try {
          console.log("Starting generation for image ID:", image.id);
          const { data, error } = await supabase.functions.invoke('generate-image', {
            body: { 
              prompt: prompt.trim(),
              sculptureId: image.id,
              creativity 
            }
          });
          
          if (error) {
            console.error("Error from generate-image function:", error);
            throw error;
          }
          
          if (!data?.imageUrl) {
            console.error("No image URL in response for ID:", image.id);
            throw new Error('No image URL in response');
          }
          
          console.log("Successfully generated image for ID:", image.id);
          return {
            id: image.id,
            success: true,
            url: data.imageUrl
          } as GenerationResult;
        } catch (error) {
          console.error("Error generating individual image:", error);
          return {
            id: image.id,
            success: false,
            error: true
          } as GenerationResult;
        }
      });

      // Process images in batches to show updates as they come in
      let completedResults: GenerationResult[] = [];
      const updateInterval = setInterval(() => {
        if (completedResults.length > 0) {
          const currentResults = [...completedResults];
          completedResults = [];
          
          // Update state with completed results - fixed TypeScript error here
          setGeneratedImages((prev: GeneratedImage[]) => {
            return prev.map(img => {
              const result = currentResults.find(r => r.id === img.id);
              if (result) {
                return {
                  ...img,
                  url: result.success ? result.url : null,
                  isGenerating: false,
                  error: !result.success
                };
              }
              return img;
            });
          });
        }
      }, 500);

      // Wait for all generations to complete, with a timeout
      const timeout = (ms: number) => new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Generation timeout')), ms)
      );
      
      // Process each promise and collect results
      for (const promise of generationPromises) {
        try {
          const result = await Promise.race([promise, timeout(120000)]) as GenerationResult;
          if (result) completedResults.push(result);
        } catch (error) {
          console.error("Promise failed:", error);
          // For timeout errors, we still need to create a result object
          if (error instanceof Error && error.message === 'Generation timeout') {
            const timeoutImageId = imagesToGenerate[generationPromises.indexOf(promise)]?.id;
            if (timeoutImageId) {
              completedResults.push({
                id: timeoutImageId,
                success: false,
                error: true
              });
            }
          }
        }
      }
      
      clearInterval(updateInterval);
      
      // Final update to ensure all results are processed
      const results = await Promise.all(
        generationPromises.map(promise => 
          promise.catch(error => {
            console.error("Final promise collection failed:", error);
            return { success: false, error: true } as GenerationResult;
          })
        )
      );
      
      // Update state once with all final results
      const finalImages = [...newImages].map(img => {
        const result = results.find(r => r && r.id === img.id) as GenerationResult | undefined;
        if (!result) return {
          ...img,
          isGenerating: false,
          error: true
        };
        
        return {
          ...img,
          url: result.success ? result.url : null,
          isGenerating: false,
          error: !result.success
        };
      });

      setGeneratedImages(finalImages);

      const failedCount = results.filter(r => r && !r.success).length;
      if (failedCount > 0) {
        toast({
          title: "Generation Completed",
          description: `${imagesToGenerate.length - failedCount} images generated successfully. ${failedCount} ${failedCount === 1 ? 'image' : 'images'} failed to generate.`,
          variant: failedCount === imagesToGenerate.length ? "destructive" : "default",
        });
      } else if (imagesToGenerate.length > 0) {
        toast({
          title: "Generation Completed",
          description: "All images generated successfully!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error in generation process:', error);
      toast({
        title: "Error",
        description: "Could not generate images. Please try again.",
        variant: "destructive",
      });
      
      // Update any remaining generating images to error state
      const finalImages = [...newImages].map(img => {
        if (img.isGenerating) {
          return {
            ...img,
            isGenerating: false,
            error: true
          };
        }
        return img;
      });
      
      setGeneratedImages(finalImages);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateImages
  };
}
