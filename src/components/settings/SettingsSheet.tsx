import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Settings2 } from "lucide-react";
import { ManageTagsSection } from "./ManageTagsSection";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppearanceSection } from "./AppearanceSection";
import { AIContextSection } from "./AIContextSection";
import { TagsManagementHeader } from "./TagsManagementHeader";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [aiContext, setAiContext] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleApply = async () => {
    try {
      // TODO: Implement other settings save logic
      toast.success("Settings saved successfully");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save some settings. Please try again.");
    }
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
            <AppearanceSection />
            <AIContextSection aiContext={aiContext} setAiContext={setAiContext} />
            
            <div className="space-y-4">
              <TagsManagementHeader onCreateTag={() => setShowCreateForm(true)} />
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