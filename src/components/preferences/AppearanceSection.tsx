
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Appearance</h3>
      <div className="rounded-xl border border-muted p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Theme</h4>
            <div className="flex gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"} 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
