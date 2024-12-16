import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface RegenerationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerate: (creativity: "small" | "medium" | "large", changes?: string) => void;
  isRegenerating: boolean;
}

export function RegenerationSheet({ 
  open, 
  onOpenChange, 
  onRegenerate,
  isRegenerating 
}: RegenerationSheetProps) {
  const [changes, setChanges] = useState("");
  const [creativity, setCreativity] = useState<"small" | "medium" | "large">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegenerate(creativity, changes.trim());
    onOpenChange(false);
    setChanges("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Generate Variation</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="changes" className="text-sm font-medium">
              Describe the changes you'd like
            </label>
            <Textarea
              id="changes"
              placeholder="Describe the changes you'd like to make..."
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              className="min-h-[200px] resize-y"
              rows={10}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Creativity Level
            </label>
            <ToggleGroup
              type="single"
              value={creativity}
              onValueChange={(value) => value && setCreativity(value as "small" | "medium" | "large")}
              className="justify-start"
            >
              <ToggleGroupItem value="small">Low</ToggleGroupItem>
              <ToggleGroupItem value="medium">Normal</ToggleGroupItem>
              <ToggleGroupItem value="large">High</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Button type="submit" disabled={isRegenerating} className="w-full">
            {isRegenerating ? "Generating..." : "Generate Variation"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}