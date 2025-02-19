
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
import { Switch } from "./ui/switch";

interface CreateSculptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSculptureSheet({ open, onOpenChange }: CreateSculptureSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [creativity, setCreativity] = useState<"low" | "medium" | "high">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [regenerateOnlyUnselected, setRegenerateOnlyUnselected] = useState(true);

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

  const generateImages = async (regenerateUnselected = regenerateOnlyUnselected) => {
    if (!user || !prompt.trim()) return;
    
    setIsGenerating(true);
    const numImages = 6;
    const newImages: GeneratedImage[] = [];

    if (regenerateUnselected && generatedImages.length > 0) {
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
      
      for (const image of imagesToGenerate) {
        try {
          console.log('Generating image:', image.id);
          const { data, error } = await supabase.functions.invoke('generate-image', {
            body: { 
              prompt: prompt.trim(),
              sculptureId: image.id,
              creativity: creativity 
            }
          });

          console.log('Generation response:', { data, error });

          if (error) {
            throw error;
          }

          if (!data?.imageUrl) {
            throw new Error('No image URL in response');
          }

          setGeneratedImages(current => 
            current.map(img => 
              img.id === image.id 
                ? { ...img, url: data.imageUrl, isGenerating: false }
                : img
            )
          );
        } catch (error) {
          console.error('Error generating image:', error);
          setGeneratedImages(current => 
            current.map(img => 
              img.id === image.id 
                ? { ...img, isGenerating: false, error: true }
                : img
            )
          );
          toast({
            title: "Error",
            description: "Failed to generate one or more images. Please try again.",
            variant: "destructive",
          });
        }
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
        const response = await fetch(image.url!);
        const blob = await response.blob();
        const file = new File([blob], 'generated-image.png', { type: 'image/png' });
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${image.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('sculptures')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('sculptures')
          .getPublicUrl(fileName);

        const { error: createError } = await supabase
          .from('sculptures')
          .insert([
            {
              prompt: prompt.trim(),
              user_id: user.id,
              ai_engine: "runware",
              status: "idea",
              image_url: publicUrl,
              creativity_level: creativity
            }
          ]);

        if (createError) throw createError;
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
      console.error('Error saving sculptures:', error);
      toast({
        title: "Error",
        description: "Could not save one or more sculptures. Please try again.",
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
      <SheetContent className="sm:max-w-[90vw] h-screen flex flex-col">
        <SheetHeader>
          <SheetTitle>Create New Sculpture</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your sculpture..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[200px] resize-y"
              rows={10}
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="regenerate-unselected"
                      checked={regenerateOnlyUnselected}
                      onCheckedChange={setRegenerateOnlyUnselected}
                    />
                    <Label htmlFor="regenerate-unselected">Keep selected images on regenerate</Label>
                  </div>
                  {selectedIds.size > 0 && (
                    <Button variant="ghost" onClick={clearSelection}>
                      Clear Selection
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
