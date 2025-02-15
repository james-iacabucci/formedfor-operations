
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

interface AIFieldProps {
  label: string;
  isGenerating: boolean;
  disabled: boolean;
  onGenerate: () => void;
  children: React.ReactNode;
}

export function AIField({ label, isGenerating, disabled, onGenerate, children }: AIFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={label.toLowerCase()}>{label}</Label>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          disabled={disabled}
          onClick={onGenerate}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </div>
      {children}
    </div>
  );
}
