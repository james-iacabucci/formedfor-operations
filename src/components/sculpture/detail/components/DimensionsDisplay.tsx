
import { Button } from "@/components/ui/button";
import { PencilIcon, Loader2 } from "lucide-react";

interface DimensionsDisplayProps {
  displayValue: string;
  onEditClick: () => void;
  isLoading?: boolean;
}

export function DimensionsDisplay({ 
  displayValue, 
  onEditClick,
  isLoading = false
}: DimensionsDisplayProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm">{displayValue}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        disabled={isLoading}
        className="h-7 w-7 p-0"
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
