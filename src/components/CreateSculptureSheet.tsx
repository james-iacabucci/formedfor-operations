import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { GeneratedSculptureGrid, GeneratedImage } from "./sculpture/create/GeneratedSculptureGrid";
import { CheckIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { useAIGeneration } from "@/hooks/use-ai-generation";

interface CreateSculptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSculptureSheet({ open, onOpenChange }: CreateSculptureSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { generateAIContent } = useAIGeneration();
  const [prompt, setPrompt] = useState("");
  const [creativity, setCreativity] = useState<"low" | "medium" | "high">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isPromptUpdated, setIsPromptUpdated] = useState(false);

  const handleSelect = (imageId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(imageId)) {
      newSelectedIds.delete(imageId);
    } else {
      newSelectedIds.add(imageId);
    }
    setSelectedIds(newSelectedIds);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const improvePrompt = async () => {
    if (!prompt.trim()) return;

    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('improve-prompt', {
        body: { prompt: prompt.trim() }
      });

      if (error) throw error;

      if (data?.improvedPrompt) {
        setPrompt(data.improvedPrompt);
        setIsPromptUpdated(true);
        setTimeout(() => setIsPromptUpdated(false), 1000); // Reset after 1 second
      }
    } catch (error) {
      console.error('Error improving prompt:', error);
      toast({
        title: "Error",
        description: "Could not improve prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  const generateImages = async () => {
    if (!user || !prompt.trim()) return;
    
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
      
      // Generate all images in parallel
      const generationPromises = imagesToGenerate.map(image =>
        supabase.functions.invoke('generate-image', {
          body: { 
            prompt: prompt.trim(),
            sculptureId: image.id,
            creativity: creativity 
          }
        }).then(({ data, error }) => {
          if (error) throw error;
          if (!data?.imageUrl) throw new Error('No image URL in response');
          
          setGeneratedImages(current => 
            current.map(img => 
              img.id === image.id 
                ? { ...img, url: data.imageUrl, isGenerating: false }
                : img
            )
          );
          
          return { id: image.id, success: true };
        }).catch(error => {
          console.error('Error generating image:', error);
          setGeneratedImages(current => 
            current.map(img => 
              img.id === image.id 
                ? { ...img, isGenerating: false, error: true }
                : img
            )
          );
          return { id: image.id, success: false };
        })
      );

      // Wait for all generation promises to complete
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

  const handleSaveToLibrary = async () => {
    if (!user || selectedIds.size === 0) return;
    
    setIsSaving(true);
    try {
      const selectedImages = generatedImages.filter(img => selectedIds.has(img.id));
      
      for (const image of selectedImages) {
        try {
          // Download the image first
          const response = await fetch(image.url!);
          if (!response.ok) {
            throw new Error('Could not access image');
          }

          const blob = await response.blob();
          const file = new File([blob], 'generated-image.png', { type: 'image/png' });
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${image.id}/${crypto.randomUUID()}.${fileExt}`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('sculptures')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('sculptures')
            .getPublicUrl(fileName);

          // Generate AI content using the same hook used for regeneration
          let aiName = '';
          let aiDescription = '';

          await generateAIContent('name', file, '', (name) => {
            aiName = name;
          });

          await generateAIContent('description', file, aiName, (description) => {
            aiDescription = description;
          });

          // Create sculpture with all info
          const { error: createError } = await supabase
            .from('sculptures')
            .insert([
              {
                prompt: prompt.trim(),
                user_id: user.id,
                ai_engine: "runware",
                status: "idea",
                image_url: publicUrl,
                creativity_level: creativity,
                ai_generated_name: aiName,
                ai_description: aiDescription
              }
            ]);

          if (createError) {
            console.error('Create error:', createError);
            throw createError;
          }

        } catch (imageError) {
          console.error('Failed to process image:', imageError);
          toast({
            title: "Error",
            description: "Failed to process one of the selected images.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: `${selectedIds.size} sculpture${selectedIds.size > 1 ? 's' : ''} saved to library.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      onOpenChange(false);
      
      setPrompt("");
      setGeneratedImages([]);
      clearSelection();
      
    } catch (error) {
      console.error('Error in save process:', error);
      toast({
        title: "Error",
        description: "Could not complete the save operation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setPrompt("");
      setGeneratedImages([]);
      clearSelection();
      setIsGenerating(false);
      setIsSaving(false);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[800px] h-screen flex flex-col">
        <SheetHeader>
          <SheetTitle>Create New Sculpture</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4 flex-1 overflow-y-auto px-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">Prompt</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={improvePrompt}
                  disabled={isImproving || !prompt.trim()}
                  className="h-8 px-2"
                >
                  {isImproving ? (
                    <>
                      <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <RefreshCwIcon className="h-4 w-4 mr-2" />
                      Improve Prompt
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="prompt"
                placeholder="Describe your sculpture..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={cn(
                  "min-h-[80px] resize-y transition-colors duration-300",
                  isPromptUpdated && "bg-green-50 dark:bg-green-900/20"
                )}
                rows={5}
              />
            </div>
            
            <Tabs value={creativity} onValueChange={(v) => setCreativity(v as typeof creativity)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="low">Low Creativity</TabsTrigger>
                <TabsTrigger value="medium">Medium Creativity</TabsTrigger>
                <TabsTrigger value="high">High Creativity</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {generatedImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Generated Sculptures</h3>
                <div className="flex items-center gap-4">
                  {selectedIds.size > 0 && (
                    <Button variant="ghost" onClick={clearSelection}>
                      Clear Selections
                    </Button>
                  )}
                </div>
              </div>
              <GeneratedSculptureGrid
                images={generatedImages}
                onSelect={handleSelect}
                selectedIds={selectedIds}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          
          {selectedIds.size > 0 && (
            <Button 
              variant="secondary"
              onClick={handleSaveToLibrary}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Save to Library
                </>
              )}
            </Button>
          )}
          
          <Button 
            onClick={() => generateImages()}
            disabled={isGenerating || isSaving || !prompt.trim()}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                {generatedImages.length > 0 ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4" />
                    Regenerate
                  </>
                ) : (
                  'Generate'
                )}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
