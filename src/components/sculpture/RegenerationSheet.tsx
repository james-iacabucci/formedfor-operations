import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface RegenerationOptions {
  creativity: "none" | "small" | "medium" | "large";
  changes?: string;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegenerate({
      creativity,
      changes: changes.trim(),
    });
    onOpenChange(false);
    setChanges("");
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