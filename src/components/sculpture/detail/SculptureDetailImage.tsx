
import { Button } from "@/components/ui/button";
import { DownloadIcon, RefreshCwIcon, PlusIcon } from "lucide-react";
import { BaseSculptureImage } from "../BaseSculptureImage";

interface SculptureDetailImageProps {
  imageUrl: string;
  prompt: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onGenerateVariant: () => void;
  onDownload: () => void;
}

export function SculptureDetailImage({
  imageUrl,
  prompt,
  isRegenerating,
  onRegenerate,
  onGenerateVariant,
  onDownload,
}: SculptureDetailImageProps) {
  return (
    <BaseSculptureImage
      imageUrl={imageUrl}
      prompt={prompt}
      isRegenerating={isRegenerating}
    >
      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
          disabled={isRegenerating}
          onClick={onRegenerate}
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
          onClick={onGenerateVariant}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
          onClick={onDownload}
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
      </div>
    </BaseSculptureImage>
  );
}
