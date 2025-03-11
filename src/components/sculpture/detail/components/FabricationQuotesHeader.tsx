
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface FabricationQuotesHeaderProps {
  onAddQuote: () => void;
  disabled: boolean;
}

export function FabricationQuotesHeader({
  onAddQuote,
  disabled
}: FabricationQuotesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">Fabrication Quotes</h2>
      <Button 
        onClick={onAddQuote} 
        size="sm" 
        disabled={disabled}
        variant="outline"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Quote
      </Button>
    </div>
  );
}
