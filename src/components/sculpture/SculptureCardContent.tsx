
import { CardContent } from "@/components/ui/card";
import { SculptureCardImage } from "./SculptureCardImage";
import { SculptureInfo } from "./SculptureInfo";
import { Sculpture } from "@/types/sculpture";
import { Link, useNavigate } from "react-router-dom";

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
  onDownloadPDF: () => void;
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
  onDownloadPDF,
}: SculptureCardContentProps) {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't navigate if clicking on or within buttons, selects, or other interactive elements
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'SELECT' ||
      target.closest('button') ||
      target.closest('select') ||
      target.closest('[role="button"]') ||
      target.closest('[role="listbox"]') ||
      target.closest('[role="menu"]')
    ) {
      return;
    }
    navigate(`/sculpture/${sculpture.id}`);
  };

  return (
    <CardContent className="p-0">
      <div 
        className="relative cursor-pointer" 
        onClick={handleCardClick}
      >
        {/* Image section */}
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
            onDownloadPDF={onDownloadPDF}
            status={sculpture.status}
          />
        </div>

        {/* Info section */}
        <div className="p-4 transition-all duration-300 group-hover:bg-muted/50">
          <div className="flex flex-col gap-3">
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
