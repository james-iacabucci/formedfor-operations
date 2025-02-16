
import { ImageIcon } from "lucide-react";

interface SculptureImageProps {
  imageUrl: string | null;
  prompt: string;
  isRegenerating: boolean;
  onImageClick: () => void;
}

export function SculptureImage({ imageUrl, prompt, isRegenerating, onImageClick }: SculptureImageProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={prompt}
        className="h-full w-full object-cover transition-all duration-300 will-change-transform group-hover:scale-105"
        onClick={onImageClick}
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center text-muted-foreground">
        <ImageIcon className="mb-2 h-12 w-12 animate-pulse" />
        <span>{isRegenerating ? "Regenerating..." : "Generating..."}</span>
      </div>
    </div>
  );
}
