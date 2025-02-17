
import { SculptureActions } from "../SculptureActions";

interface SculptureImageProps {
  imageUrl: string;
  prompt: string;
  isRegenerating: boolean;
  onManageTags: () => void;
  onRegenerate: () => void;
}

export function SculptureImage({
  imageUrl,
  prompt,
  isRegenerating,
  onManageTags,
  onRegenerate,
}: SculptureImageProps) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <img
        src={imageUrl}
        alt={prompt}
        className="object-cover w-full h-full"
      />
      <div className="absolute top-2 right-2">
        <SculptureActions
          isRegenerating={isRegenerating}
          onManageTags={onManageTags}
          onRegenerate={onRegenerate}
        />
      </div>
    </div>
  );
}
