
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface BaseSculptureImageProps {
  imageUrl: string | null;
  prompt: string;
  isRegenerating?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function BaseSculptureImage({ 
  imageUrl, 
  prompt, 
  isRegenerating,
  className,
  children 
}: BaseSculptureImageProps) {
  if (!imageUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <div className="flex flex-col items-center text-muted-foreground">
          <Loader2 className="mb-2 h-10 w-10 animate-spin" />
          <span className="text-sm">{isRegenerating ? "Regenerating..." : "Generating..."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-square w-full overflow-hidden", className)}>
      <img
        src={imageUrl}
        alt={prompt}
        className="object-cover w-full h-full"
      />
      {isRegenerating && (
        <div 
          className="absolute inset-0 z-10 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm"
          aria-live="polite"
        >
          <Loader2 className="h-10 w-10 animate-spin text-white mb-2" />
          <span className="text-white text-sm font-medium">Regenerating image...</span>
        </div>
      )}
      {children}
    </div>
  );
}
