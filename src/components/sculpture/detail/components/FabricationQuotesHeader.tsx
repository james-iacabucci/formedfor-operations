
import { Button } from "@/components/ui/button";
import { DollarSign, MessageSquare } from "lucide-react";

interface FabricationQuotesHeaderProps {
  onAddQuote: () => void;
  onOpenChat: () => void;
  disabled: boolean;
}

export function FabricationQuotesHeader({
  onAddQuote,
  onOpenChat,
  disabled
}: FabricationQuotesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">Fabrication Quotes</h2>
      <div className="flex gap-2">
        <Button 
          onClick={onOpenChat} 
          size="sm"
          variant="ghost"
          className="h-10 w-10 p-0"
          title="Chat about quotes"
        >
          <MessageSquare className="h-4 w-4 stroke-[1.5px]" />
        </Button>
        <Button 
          onClick={onAddQuote} 
          size="sm" 
          disabled={disabled}
          variant="outline"
          className="gap-1"
        >
          <DollarSign className="h-4 w-4" />
          Request Quote
        </Button>
      </div>
    </div>
  );
}
