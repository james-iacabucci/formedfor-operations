
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

    // Cleanup function that only targets potential stray settings sheet portals
    return () => {
      const portals = document.querySelectorAll('[data-state="closed"][role="dialog"]');
      portals.forEach(portal => {
        // Only remove if it's likely a settings sheet portal (check for settings-related content)
        if (portal.innerHTML.includes('Settings') && portal.parentNode) {
          try {
            portal.parentNode.removeChild(portal);
          } catch (error) {
            console.debug('Portal already removed:', error);
          }
        }
      });
    };
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
      onOpenChange={onOpenChange}
      defaultOpen={false}
    >
      <SheetContent 
        className="sm:max-w-2xl flex flex-col p-0 overflow-hidden"
        onEscapeKeyDown={() => onOpenChange(false)}
        onInteractOutside={(e) => {
          e.preventDefault();
          onOpenChange(false);
        }}
      >
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
      </SheetContent>
    </Sheet>
  );
}
