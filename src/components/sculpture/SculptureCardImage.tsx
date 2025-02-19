
import { Button } from "@/components/ui/button";
import { DownloadIcon, TagIcon, Trash2Icon, RefreshCwIcon, PlusIcon } from "lucide-react";
import { BaseSculptureImage } from "./BaseSculptureImage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
        <TooltipProvider>
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete sculpture</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage tags</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
                  <RefreshCwIcon className={cn("h-4 w-4", {
                    "animate-spin": isRegenerating
                  })} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Regenerate image</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate variation</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Download image</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </BaseSculptureImage>
    </div>
  );
}
