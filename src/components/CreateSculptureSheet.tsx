import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { GeneratedSculptureGrid, GeneratedImage } from "./sculpture/create/GeneratedSculptureGrid";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { PromptSection } from "./sculpture/create/PromptSection";
import { GenerateActions } from "./sculpture/create/GenerateActions";
import { useSculptureGeneration } from "@/hooks/use-sculpture-generation";

interface CreateSculptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProductLineId?: string | null;
}

export function CreateSculptureSheet({ 
  open, 
  onOpenChange,
  defaultProductLineId 
}: CreateSculptureSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { generateAIContent } = useAIGeneration();
  const { isGenerating, generateImages } = useSculptureGeneration();
  const [prompt, setPrompt] = useState("");
  const [creativity, setCreativity] = useState<"low" | "medium" | "high">("medium");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
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

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    setIsPromptUpdated(true);
    setTimeout(() => setIsPromptUpdated(false), 1000);
  };

  const handleSaveToLibrary = async () => {
    if (!user || selectedIds.size === 0) return;
    
    setIsSaving(true);
    try {
      const selectedImages = generatedImages.filter(img => selectedIds.has(img.id));
      
      for (const image of selectedImages) {
        try {
          const response = await fetch(image.url!);
          if (!response.ok) {
            throw new Error('Could not access image');
          }

          const blob = await response.blob();
          const file = new File([blob], 'generated-image.png', { type: 'image/png' });
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${image.id}/${crypto.randomUUID()}.${fileExt}`;
          
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

          let aiName = '';
          let aiDescription = '';

          await generateAIContent('name', file, '', (name) => {
            aiName = name;
          });

          await generateAIContent('description', file, aiName, (description) => {
            aiDescription = description;
          });

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
                ai_description: aiDescription,
                product_line_id: defaultProductLineId || null
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
            <PromptSection 
              prompt={prompt}
              onPromptChange={handlePromptChange}
              isPromptUpdated={isPromptUpdated}
            />
            
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
        
        <GenerateActions
          onClose={() => onOpenChange(false)}
          onSave={handleSaveToLibrary}
          onGenerate={() => generateImages(
            prompt,
            creativity,
            generatedImages,
            selectedIds,
            setGeneratedImages,
            clearSelection
          )}
          isSaving={isSaving}
          isGenerating={isGenerating}
          hasPrompt={!!prompt.trim()}
          selectedCount={selectedIds.size}
          hasGeneratedImages={generatedImages.length > 0}
        />
      </SheetContent>
    </Sheet>
  );
}
