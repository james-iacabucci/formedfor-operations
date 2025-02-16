
import { SculptureActions } from "../SculptureActions";

interface SculptureImageProps {
  imageUrl: string;
  prompt: string;
  isRegenerating: boolean;
  onDelete: () => void;
  onDownload: () => void;
  onManageTags: () => void;
  onRegenerate: () => void;
}

export function SculptureImage({
  imageUrl,
  prompt,
  isRegenerating,
  onDelete,
  onDownload,
  onManageTags,
  onRegenerate,
}: SculptureImageProps) {
  return (
    <div className="relative w-full h-full">
      <img
        src={imageUrl}
        alt={prompt}
        className="object-cover w-full h-full"
      />
      <div className="absolute top-2 right-2">
        <SculptureActions
          isRegenerating={isRegenerating}
          onDelete={onDelete}
          onDownload={onDownload}
          onManageTags={onManageTags}
          onRegenerate={onRegenerate}
        />
      </div>
    </div>
  );
}
