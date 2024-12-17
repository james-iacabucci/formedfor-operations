import { Card, CardContent } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";
import { SculptureImage } from "./SculptureImage";
import { SculptureInfo } from "./SculptureInfo";
import { useNavigate } from "react-router-dom";
import { SculptureCardActions } from "./SculptureCardActions";

interface SculptureCardProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  onDelete: (sculpture: Sculpture) => void;
  onManageTags: (sculpture: Sculpture) => void;
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

  return (
    <Card
      className={`group relative ${sculpture.image_url ? "cursor-pointer" : ""}`}
      onClick={(e) => {
        if (
          sculpture.image_url &&
          !(e.target as HTMLElement).closest("button")
        ) {
          navigate(`/sculpture/${sculpture.id}`);
        }
      }}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <SculptureImage
            imageUrl={sculpture.image_url}
            prompt={sculpture.prompt}
            isRegenerating={false}
            onImageClick={() => navigate(`/sculpture/${sculpture.id}`)}
          />
          {sculpture.image_url && (
            <SculptureCardActions
              sculptureId={sculpture.id}
              prompt={sculpture.prompt}
              imageUrl={sculpture.image_url}
              onDelete={() => onDelete(sculpture)}
              onManageTags={() => onManageTags(sculpture)}
            />
          )}
        </div>
        <div className="px-4 pb-4">
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