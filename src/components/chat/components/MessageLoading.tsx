
import { Loader2 } from "lucide-react";

interface MessageLoadingProps {
  isFetchingNextPage: boolean;
}

export function MessageLoading({ isFetchingNextPage }: MessageLoadingProps) {
  if (!isFetchingNextPage) return null;
  
  return (
    <div className="flex justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
