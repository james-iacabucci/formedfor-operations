
import { Button } from "@/components/ui/button";
import { DownloadIcon, TagIcon, Trash2Icon, RefreshCwIcon, PlusIcon } from "lucide-react";
import { BaseSculptureImage } from "./BaseSculptureImage";

interface SculptureCardImageProps {
  imageUrl: string | null;
  prompt: string;
  isRegenerating?: boolean;
  onDelete: () => void;
  onManageTags: () => void;
  onRegenerate: () => void;
  onGenerateVariant: () => void;
  onDownload: () => void;
  onClick?: () => void;
}

export function SculptureCardImage({
  imageUrl,
  prompt,
  isRegenerating,
  onDelete,
  onManageTags,
  onRegenerate,
  onGenerateVariant,
  onDownload,
  onClick,
}: SculptureCardImageProps) {
  return (
    <div
      className="relative w-full h-full cursor-pointer"
      onClick={(e) => {
        // Only trigger the click if the target is the container or the image itself
        if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
          onClick?.();
        }
      }}
    >
      <BaseSculptureImage
        imageUrl={imageUrl}
        prompt={prompt}
        isRegenerating={isRegenerating}
      >
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onManageTags();
            }}
          >
            <TagIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            disabled={isRegenerating}
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onGenerateVariant();
            }}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </BaseSculptureImage>
    </div>
  );
}
