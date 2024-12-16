import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Settings2, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ManageTagsSection } from "./ManageTagsSection";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [aiContext, setAiContext] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleApply = () => {
    // TODO: Implement settings save logic
    toast.success("Settings saved successfully");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col p-0">
        <SheetHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6">
          <div className="py-6 space-y-8">
            {/* Appearance Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Appearance</h3>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Choose light or dark mode theme</Label>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* AI Context Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">AI Generation</h3>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="ai-context">Default AI Context</Label>
                <p className="text-xs italic text-muted-foreground">
                  This context will be automatically included in all your AI image generation prompts
                </p>
                <Textarea
                  id="ai-context"
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  placeholder="Enter your default AI image generation context..."
                  className="min-h-[120px]"
                />
              </div>
            </div>

            {/* Tags Management Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Manage Sculpture Tags</h3>
                <Button 
                  onClick={() => setShowCreateForm(true)} 
                  size="sm"
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tag
                </Button>
              </div>
              <Separator />
              <ManageTagsSection />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t bg-background px-6 py-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}