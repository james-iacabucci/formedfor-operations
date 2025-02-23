
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

interface RegenerateButtonProps {
  onClick: () => void;
  isRegenerating: boolean;
}

export function RegenerateButton({ onClick, isRegenerating }: RegenerateButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={isRegenerating}
    >
      <RefreshCwIcon className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
    </Button>
  );
}
