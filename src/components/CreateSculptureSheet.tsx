
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
import { useQuery } from "@tanstack/react-query";

interface CreateSculptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSculptureSheet({ open, onOpenChange }: CreateSculptureSheetProps) {
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
  const [selectedProductLineId, setSelectedProductLineId] = useState<string>("");

  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (productLines && productLines.length > 0 && !selectedProductLineId) {
      setSelectedProductLineId(productLines[0].id);
    }
  }, [productLines, selectedProductLineId]);

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

  const processSingleImage = async (image: GeneratedImage) => {
    try {
      console.log("Processing image:", image.id);
      const response = await fetch(image.url!);
      if (!response.ok) {
        throw new Error('Could not access image');
      }

      const blob = await response.blob();
      const file = new File([blob], 'generated-image.png', { type: 'image/png' });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${image.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('sculptures')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('sculptures')
        .getPublicUrl(fileName);

      const timeoutDuration = 30000; // 30 seconds
      const generateWithTimeout = async (type: 'name' | 'description', existingName = '') => {
        const contentPromise = new Promise<string>((resolve) => {
          generateAIContent(type, file, existingName, (content) => {
            resolve(content);
          });
        });

        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error(`${type} generation timed out`)), timeoutDuration);
        });

        try {
          return await Promise.race([contentPromise, timeoutPromise]);
        } catch (error) {
          console.warn(`AI ${type} generation failed:`, error);
          return type === 'name' ? 'Untitled Sculpture' : 'No description available.';
        }
      };

      const aiName = await generateWithTimeout('name');
      const aiDescription = await generateWithTimeout('description', aiName);

      const { error: createError } = await supabase
        .from('sculptures')
        .insert([
          {
            prompt: prompt.trim(),
            user_id: user!.id,
            created_by: user!.id,
            ai_engine: "runware",
            status: "idea",
            image_url: publicUrl,
            creativity_level: creativity,
            ai_generated_name: aiName,
            ai_description: aiDescription,
            product_line_id: selectedProductLineId || null
          }
        ]);

      if (createError) {
        throw createError;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to process image:', error);
      return { success: false, error };
    }
  };

  const handleSaveToLibrary = async () => {
    if (!user || selectedIds.size === 0) return;
    
    setIsSaving(true);
    const selectedImages = generatedImages.filter(img => selectedIds.has(img.id));
    const results = await Promise.allSettled(selectedImages.map(processSingleImage));
    
    const successCount = results.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failureCount = selectedImages.length - successCount;

    if (successCount > 0) {
      toast({
        title: "Success",
        description: `${successCount} sculpture${successCount > 1 ? 's' : ''} saved to library.${
          failureCount > 0 ? ` ${failureCount} failed to save.` : ''
        }`,
        variant: failureCount > 0 ? "destructive" : "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      onOpenChange(false);
      
      setPrompt("");
      setGeneratedImages([]);
      clearSelection();
    } else {
      toast({
        title: "Error",
        description: "Could not save any sculptures. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSaving(false);
  };

  useEffect(() => {
    if (!open) {
      setPrompt("");
      setGeneratedImages([]);
      clearSelection();
      setIsSaving(false);
      if (productLines && productLines.length > 0) {
        setSelectedProductLineId(productLines[0].id);
      } else {
        setSelectedProductLineId("");
      }
    }
  }, [open, productLines]);

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
            
            <div className="flex flex-row gap-2 items-start">
              {productLines && productLines.length > 0 && (
                <Tabs value={selectedProductLineId} onValueChange={setSelectedProductLineId} className="flex-1">
                  <TabsList className="h-8 p-0.5 bg-muted/30">
                    {productLines.map((pl) => (
                      <TabsTrigger 
                        key={pl.id} 
                        value={pl.id}
                        className="h-7 px-3 py-1 text-xs font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                      >
                        {pl.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
              
              <Tabs value={creativity} onValueChange={(v) => setCreativity(v as typeof creativity)} className="flex-1">
                <TabsList className="h-8 p-0.5 bg-muted/30">
                  <TabsTrigger 
                    value="low" 
                    className="h-7 px-3 py-1 text-xs font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                  >
                    Low Creativity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="medium" 
                    className="h-7 px-3 py-1 text-xs font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                  >
                    Medium Creativity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="high" 
                    className="h-7 px-3 py-1 text-xs font-medium rounded-md text-foreground dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
                  >
                    High Creativity
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
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
