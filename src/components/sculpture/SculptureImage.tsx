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
        className="object-cover w-full h-full transition-transform group-hover:scale-105"
        onClick={onImageClick}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center text-muted-foreground">
        <ImageIcon className="w-12 h-12 mb-2" />
        <span>{isRegenerating ? "Regenerating..." : "Generating..."}</span>
      </div>
    </div>
  );
}