
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface RegenerationOptions {
  creativity: "none" | "small" | "medium" | "large";
  changes?: string;
  updateExisting: boolean;
  regenerateImage: boolean;
  regenerateMetadata: boolean;
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
  const [updateExisting, setUpdateExisting] = useState(false);
  const [regenerateImage, setRegenerateImage] = useState(true);
  const [regenerateMetadata, setRegenerateMetadata] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onRegenerate({
        creativity,
        changes: changes.trim(),
        updateExisting,
        regenerateImage,
        regenerateMetadata
      });
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      
      // Clear form and close sheet
      setChanges("");
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: updateExisting 
          ? "Updates generated successfully." 
          : "Variation created successfully.",
      });
    } catch (error) {
      console.error("Error generating variation:", error);
      toast({
        title: "Error",
        description: "Failed to generate. Please try again.",
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

          <div className="space-y-2">
            <Label className="text-sm font-medium">Variation Mode</Label>
            <RadioGroup
              defaultValue="new"
              value={updateExisting ? "update" : "new"}
              onValueChange={(value) => setUpdateExisting(value === "update")}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Create New Sculpture</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update" id="update" />
                <Label htmlFor="update">Update Existing Sculpture</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="regenerate-image" className="text-sm font-medium">
                Regenerate Image
              </Label>
              <Switch
                id="regenerate-image"
                checked={regenerateImage}
                onCheckedChange={setRegenerateImage}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="regenerate-metadata" className="text-sm font-medium">
                Regenerate Name & Description
              </Label>
              <Switch
                id="regenerate-metadata"
                checked={regenerateMetadata}
                onCheckedChange={setRegenerateMetadata}
              />
            </div>
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
