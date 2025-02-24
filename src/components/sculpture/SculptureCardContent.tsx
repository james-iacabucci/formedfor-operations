
import { CardContent } from "@/components/ui/card";
import { SculptureCardImage } from "./SculptureCardImage";
import { SculptureInfo } from "./SculptureInfo";
import { Sculpture } from "@/types/sculpture";
import { Link } from "react-router-dom";

interface SculptureCardContentProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  isRegenerating: (id: string) => boolean;
  showAIContent?: boolean;
  onDelete: () => void;
  onManageTags: () => void;
  onRegenerate: () => void;
  onGenerateVariant: () => void;
  onDownload: () => void;
}

export function SculptureCardContent({
  sculpture,
  tags,
  isRegenerating,
  showAIContent,
  onDelete,
  onManageTags,
  onRegenerate,
  onGenerateVariant,
  onDownload,
}: SculptureCardContentProps) {
  return (
    <CardContent className="p-0">
      <div className="relative">
        {/* Image section - not wrapped in Link */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted">
          <div className="absolute inset-0 z-10 transition-colors duration-300 group-hover:bg-black/5" />
          <SculptureCardImage
            imageUrl={sculpture.image_url}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating(sculpture.id)}
            onDelete={onDelete}
            onManageTags={onManageTags}
            onRegenerate={onRegenerate}
            onGenerateVariant={onGenerateVariant}
            onDownload={onDownload}
          />
        </div>

        {/* Info section - split into navigable and interactive parts */}
        <div className="p-4 transition-all duration-300 group-hover:bg-muted/50">
          <div className="flex flex-col gap-3">
            {/* Navigable content */}
            <Link 
              to={`/sculpture/${sculpture.id}`}
              className="block"
            >
              <h3 className="font-semibold line-clamp-1">
                {sculpture.ai_generated_name || "Untitled Sculpture"}
              </h3>
            </Link>

            {/* Interactive content - not wrapped in Link */}
            <SculptureInfo 
              sculpture={sculpture}
              tags={tags}
              showAIContent={showAIContent}
            />
          </div>
        </div>
      </div>
    </CardContent>
  );
}
