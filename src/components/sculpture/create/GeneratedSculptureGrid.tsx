
import { cn } from "@/lib/utils";
import { BaseSculptureImage } from "@/components/sculpture/BaseSculptureImage";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, LockIcon } from "lucide-react";

export interface GeneratedImage {
  id: string;
  url: string | null;
  isGenerating: boolean;
  prompt: string;
  error?: boolean;
}

interface GeneratedSculptureGridProps {
  images: GeneratedImage[];
  onSelect: (imageId: string) => void;
  selectedIds: Set<string>;
}

export function GeneratedSculptureGrid({ 
  images, 
  onSelect,
  selectedIds
}: GeneratedSculptureGridProps) {
  console.log("GeneratedSculptureGrid rendering with images:", images);

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image) => {
        console.log("Rendering image:", image);
        return (
          <button
            key={image.id}
            onClick={() => onSelect(image.id)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border-2 border-transparent transition-all",
              selectedIds.has(image.id) && "border-primary",
              image.error && "border-destructive"
            )}
          >
            <BaseSculptureImage
              imageUrl={image.url}
              prompt={image.prompt}
              isRegenerating={image.isGenerating}
            />
            {selectedIds.has(image.id) && (
              <>
                <div className="absolute inset-0 bg-primary/20" />
                <Badge 
                  className="absolute top-2 right-2 gap-1 bg-primary/90"
                  variant="default"
                >
                  <LockIcon className="h-3 w-3" />
                  Locked
                </Badge>
              </>
            )}
            {image.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                <Badge 
                  className="gap-1"
                  variant="destructive"
                >
                  <AlertCircle className="h-3 w-3" />
                  Generation Failed
                </Badge>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
