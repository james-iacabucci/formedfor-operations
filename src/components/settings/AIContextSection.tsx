import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface AIContextSectionProps {
  aiContext: string;
  setAiContext: (value: string) => void;
}

export function AIContextSection({ aiContext, setAiContext }: AIContextSectionProps) {
  return (
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
  );
}