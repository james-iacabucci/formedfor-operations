
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RegenerationOptions {
  creativity: "none" | "small" | "medium" | "large";
  changes?: string;
  updateExisting?: boolean;
  regenerateImage?: boolean;
  regenerateMetadata?: boolean;
}

interface RegenerationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerate: (options: RegenerationOptions) => void;
  isRegenerating: boolean;
}

export function RegenerationSheet({ 
  open, 
  onOpenChange, 
  onRegenerate,
  isRegenerating 
}: RegenerationSheetProps) {
  const [changes, setChanges] = useState("");
  const [creativity, setCreativity] = useState<"none" | "small" | "medium" | "large">("medium");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onRegenerate({
        creativity,
        changes: changes.trim(),
        updateExisting: false, // Always create a new variation
        regenerateImage: true,
        regenerateMetadata: true
      });
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      
      // Clear form and close sheet
      setChanges("");
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Variation created successfully. Image generation in progress...",
      });
    } catch (error) {
      console.error("Error generating variation:", error);
      toast({
        title: "Error",
        description: "Failed to create variation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>Generate Variation</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2">
            <label htmlFor="changes" className="text-sm font-medium">
              Describe the changes you'd like to make (Optional)
            </label>
            <Textarea
              id="changes"
              placeholder="What aspects specifically do you want to change"
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              className="min-h-[200px] resize-y"
              rows={10}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Creativity Level
            </label>
            <ToggleGroup
              type="single"
              value={creativity}
              onValueChange={(value) => value && setCreativity(value as "none" | "small" | "medium" | "large")}
              className="justify-start"
              onClick={(e) => e.stopPropagation()}
            >
              <ToggleGroupItem value="none">None</ToggleGroupItem>
              <ToggleGroupItem value="small">Low</ToggleGroupItem>
              <ToggleGroupItem value="medium">Normal</ToggleGroupItem>
              <ToggleGroupItem value="large">High</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Button 
            type="submit" 
            disabled={isRegenerating} 
            className="w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {isRegenerating ? "Generating..." : "Generate Variation"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
