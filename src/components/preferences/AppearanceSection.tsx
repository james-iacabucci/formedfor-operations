
import { Label } from "@/components/ui/label";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function AppearanceSection() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Appearance</h3>
      <div className="rounded-xl border border-muted p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="theme" className="sr-only">Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <SunIcon className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <MoonIcon className="h-4 w-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
