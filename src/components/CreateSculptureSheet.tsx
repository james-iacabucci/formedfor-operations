
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
            ai_engine: "runware",
            status: "idea" // Add explicit status
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

      const { error: generateError } = await supabase.functions.invoke('generate-image', {
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
