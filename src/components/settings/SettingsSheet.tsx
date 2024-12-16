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
import { Separator } from "@/components/ui/separator";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [aiContext, setAiContext] = useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-8">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
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
              <p className="text-sm text-muted-foreground">
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
            <h3 className="text-lg font-medium">Tags</h3>
            <Separator />
            <ManageTagsSection />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}