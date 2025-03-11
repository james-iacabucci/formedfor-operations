
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenIcon } from "lucide-react";

interface WeightDisplayProps {
  displayValue: string;
  metricValue: string;
  onEditClick: () => void;
}

export function WeightDisplay({ 
  displayValue, 
  metricValue, 
  onEditClick 
}: WeightDisplayProps) {
  const isEmpty = !displayValue;
  const displayText = isEmpty ? "" : `${displayValue} ${metricValue}`;

  return (
    <div className="flex items-center justify-between border rounded-md py-0 px-3 group">
      <div className="flex gap-1 items-center flex-1">
        <span className="text-muted-foreground text-sm">Weight:</span>
        <Input
          readOnly
          value={displayText}
          placeholder="Enter weight"
          className={`border-0 focus-visible:ring-0 px-0 ${isEmpty ? 'placeholder:text-muted-foreground' : ''}`}
          onClick={onEditClick}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <PenIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
