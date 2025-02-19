
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";

interface BaseSculptureImageProps {
  imageUrl: string | null;
  prompt: string;
  isRegenerating?: boolean;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function BaseSculptureImage({ 
  imageUrl, 
  prompt, 
  isRegenerating,
  className,
  onClick,
  children 
}: BaseSculptureImageProps) {
  if (!imageUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center text-muted-foreground">
          <ImageIcon className="mb-2 h-12 w-12 animate-pulse" />
          <span>{isRegenerating ? "Regenerating..." : "Generating..."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full rounded-lg overflow-hidden", className)}>
      <img
        src={imageUrl}
        alt={prompt}
        className="object-cover w-full h-full cursor-pointer"
        onClick={onClick}
      />
      {children}
    </div>
  );
}
