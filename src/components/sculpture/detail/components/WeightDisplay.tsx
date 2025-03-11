
import { Button } from "@/components/ui/button";
import { PencilIcon, Loader2 } from "lucide-react";

interface WeightDisplayProps {
  displayValue: string;
  metricValue: string;
  onEditClick: () => void;
  isLoading?: boolean;
}

export function WeightDisplay({ 
  displayValue, 
  metricValue, 
  onEditClick,
  isLoading = false
}: WeightDisplayProps) {
  return (
    <div className="flex justify-between items-center border rounded-md px-3 py-2 group relative">
      <div>
        <span className="text-sm">{displayValue}</span>
        <span className="text-sm text-muted-foreground ml-1.5">
          {metricValue && `(${metricValue})`}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        disabled={isLoading}
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PencilIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
