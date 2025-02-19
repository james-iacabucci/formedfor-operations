
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface AdvancedGenerationOptionsProps {
  seed: string;
  onSeedChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  batchSize: number;
  onBatchSizeChange: (value: number) => void;
}

export function AdvancedGenerationOptions({
  seed,
  onSeedChange,
  negativePrompt,
  onNegativePromptChange,
  batchSize,
  onBatchSizeChange,
}: AdvancedGenerationOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="seed">Seed (optional)</Label>
        <Input
          id="seed"
          type="number"
          placeholder="Leave empty for random"
          value={seed}
          onChange={(e) => onSeedChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Use the same seed to reproduce exact results
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="negativePrompt">Negative Prompt</Label>
        <Textarea
          id="negativePrompt"
          placeholder="Describe what you don't want in the image..."
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          className="resize-y"
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Specify elements to exclude from the generation
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Batch Size</Label>
          <span className="text-sm text-muted-foreground">{batchSize} images</span>
        </div>
        <Slider
          value={[batchSize]}
          onValueChange={(value) => onBatchSizeChange(value[0])}
          min={1}
          max={6}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Generate multiple images at once
        </p>
      </div>
    </div>
  );
}
