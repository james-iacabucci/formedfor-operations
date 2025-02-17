
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Settings2 } from "lucide-react";
import { ManageTagsSection } from "./ManageTagsSection";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppearanceSection } from "./AppearanceSection";
import { AIContextSection } from "./AIContextSection";
import { ValueListsSection } from "./ValueListsSection";
import { ProductLinesSection } from "./ProductLinesSection";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [aiContext, setAiContext] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setShowCreateForm(false);
    }
  }, [open]);

  const handleApply = async () => {
    try {
      toast.success("Settings saved successfully");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save some settings. Please try again.");
    }
  };

  return (
    <Sheet 
      open={open} 
      onOpenChange={(value) => {
        // Only allow closing through buttons or ESC key
        if (!value) {
          onOpenChange(false);
        }
      }}
    >
      <SheetContent 
        className="sm:max-w-2xl flex flex-col p-0 overflow-hidden"
        onEscapeKeyDown={() => onOpenChange(false)}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Settings
            </SheetTitle>
            <SheetDescription className="sr-only">
              Configure application settings
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6">
            <div className="py-6 space-y-8">
              <AppearanceSection />
              <AIContextSection aiContext={aiContext} setAiContext={setAiContext} />
              <ValueListsSection />
              <ProductLinesSection />
              <ManageTagsSection />
            </div>
          </div>

          <div className="sticky bottom-0 border-t bg-background px-6 py-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              type="button"
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
