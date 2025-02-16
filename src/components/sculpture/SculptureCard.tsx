
import { Card, CardContent } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";
import { SculptureImage } from "./SculptureImage";
import { SculptureInfo } from "./SculptureInfo";
import { useNavigate } from "react-router-dom";
import { SculptureCardActions } from "./SculptureCardActions";

interface SculptureCardProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  onDelete: () => void;
  onManageTags: () => void;
  showAIContent?: boolean;
}

export function SculptureCard({
  sculpture,
  tags,
  onDelete,
  onManageTags,
  showAIContent,
}: SculptureCardProps) {
  const navigate = useNavigate();

  if (!sculpture?.id) {
    return null;
  }

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
    >
      <CardContent className="p-0">
        <div 
          className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted cursor-pointer"
          onClick={() => {
            if (sculpture.image_url) {
              navigate(`/sculpture/${sculpture.id}`);
            }
          }}
        >
          <div className="absolute inset-0 z-10 transition-colors duration-300 group-hover:bg-black/5" />
          <SculptureImage
            imageUrl={sculpture.image_url}
            prompt={sculpture.prompt}
            isRegenerating={false}
            onImageClick={() => navigate(`/sculpture/${sculpture.id}`)}
          />
          <SculptureCardActions
            sculptureId={sculpture.id}
            prompt={sculpture.prompt}
            imageUrl={sculpture.image_url}
            onDelete={onDelete}
            onManageTags={onManageTags}
          />
        </div>
        <div className="p-4 transition-all duration-300 group-hover:bg-muted/50">
          <SculptureInfo 
            sculpture={sculpture}
            tags={tags}
            showAIContent={showAIContent}
          />
        </div>
      </CardContent>
    </Card>
  );
}
