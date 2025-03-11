
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, XIcon } from "lucide-react";

interface WeightEditFormProps {
  weight: {
    kg: string;
    lbs: string;
  };
  onLbsChange: (value: string) => void;
  onKgChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function WeightEditForm({
  weight,
  onLbsChange,
  onKgChange,
  onSave,
  onCancel,
}: WeightEditFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="weight-lbs-input">Weight (lbs)</Label>
          <Input
            id="weight-lbs-input"
            type="number"
            value={weight.lbs}
            onChange={(e) => onLbsChange(e.target.value)}
            placeholder="Weight (lbs)"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight-kg-input">Weight (kg)</Label>
          <Input
            id="weight-kg-input"
            type="number"
            value={weight.kg}
            onChange={(e) => onKgChange(e.target.value)}
            placeholder="Weight (kg)"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          <XIcon className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button
          onClick={onSave}
          size="sm"
          variant="default"
        >
          <CheckIcon className="h-4 w-4 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}
