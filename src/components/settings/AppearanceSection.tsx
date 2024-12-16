import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppearanceSection() {
  return (
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
  );
}