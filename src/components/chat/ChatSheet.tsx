
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatThread } from "./ChatThread";

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  sculptureId: string;
  quoteMode?: boolean;
  variantId?: string | null;
}

export function ChatSheet({ 
  open, 
  onOpenChange, 
  threadId, 
  sculptureId, 
  quoteMode = false,
  variantId
}: ChatSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col h-full">
        <ChatThread 
          threadId={threadId} 
          sculptureId={sculptureId} 
          isQuote={quoteMode}
          variantId={variantId} 
        />
      </SheetContent>
    </Sheet>
  );
}
