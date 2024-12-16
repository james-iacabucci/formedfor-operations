import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Settings2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ManageTagsSection } from "./ManageTagsSection";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [aiContext, setAiContext] = useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <ThemeToggle />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-context">Default AI Context</Label>
            <Textarea
              id="ai-context"
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              placeholder="Enter your default AI image generation context..."
              rows={10}
            />
          </div>

          <ManageTagsSection />
        </div>
      </SheetContent>
    </Sheet>
  );
}