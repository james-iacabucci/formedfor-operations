
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, XIcon, Loader2 } from "lucide-react";

interface Dimensions {
  height: string;
  width: string;
  depth: string;
}

interface DimensionsEditFormProps {
  dimensions: Dimensions;
  onDimensionChange: (field: keyof Dimensions, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function DimensionsEditForm({
  dimensions,
  onDimensionChange,
  onSave,
  onCancel,
  isSaving = false,
}: DimensionsEditFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-2">
          <Label htmlFor="height-input">Height (in)</Label>
          <Input
            id="height-input"
            type="number"
            value={dimensions.height}
            onChange={(e) => onDimensionChange("height", e.target.value)}
            placeholder="Height"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="width-input">Width (in)</Label>
          <Input
            id="width-input"
            type="number"
            value={dimensions.width}
            onChange={(e) => onDimensionChange("width", e.target.value)}
            placeholder="Width"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depth-input">Depth (in)</Label>
          <Input
            id="depth-input"
            type="number"
            value={dimensions.depth}
            onChange={(e) => onDimensionChange("depth", e.target.value)}
            placeholder="Depth"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          <XIcon className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button
          onClick={onSave}
          size="sm"
          variant="default"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-1" /> Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
