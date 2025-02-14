
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CreateSculptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSculptureSheet({ open, onOpenChange }: CreateSculptureSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [aiEngine, setAiEngine] = useState<"runware" | "runway">("runware");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: sculpture, error } = await supabase
        .from('sculptures')
        .insert([
          {
            prompt: prompt.trim(),
            user_id: user.id,
            ai_engine: aiEngine
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating sculpture:', error);
        toast({
          title: "Error",
          description: "Could not create sculpture. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Call the appropriate AI service based on the selected engine
      const functionName = aiEngine === 'runway' ? 'generate-image-runway' : 'generate-image';
      const { error: generateError } = await supabase.functions.invoke(functionName, {
        body: { prompt: prompt.trim(), sculptureId: sculpture.id }
      });

      if (generateError) {
        console.error('Error generating image:', generateError);
        toast({
          title: "Warning",
          description: "Sculpture created, but image generation failed. Please try again later.",
        });
      }
      
      setPrompt("");
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Sculpture created successfully. Image generation in progress...",
      });
      
      // Refresh the sculptures list
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      
    } catch (error) {
      console.error('Error creating sculpture:', error);
      toast({
        title: "Error",
        description: "Could not create sculpture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create New Sculpture</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="aiEngine" className="block text-sm font-medium mb-2">
                AI Engine
              </label>
              <Select
                value={aiEngine}
                onValueChange={(value: "runware" | "runway") => setAiEngine(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="runware">Runware AI</SelectItem>
                  <SelectItem value="runway">Runway ML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Describe your sculpture..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[200px] resize-y"
              rows={10}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Sculpture"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
