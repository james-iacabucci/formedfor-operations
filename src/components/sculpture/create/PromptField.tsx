
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function PromptField({ value, onChange }: PromptFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="prompt">Prompt</Label>
      <Textarea
        id="prompt"
        placeholder="Describe your sculpture..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] resize-y"
        rows={3}
      />
    </div>
  );
}
