
import { LinkIcon, TagIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";
import { Badge } from "@/components/ui/badge";

interface SculptureInfoProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  showAIContent?: boolean;
}

export function SculptureInfo({ sculpture, tags = [], showAIContent }: SculptureInfoProps) {
  const sculptureName = sculpture.ai_generated_name || "Untitled Sculpture";

  return (
    <div className="mt-4">
      <h3 className="font-semibold line-clamp-1">
        {sculptureName}
      </h3>

      <div className="mt-2 flex items-center justify-between">
        {sculpture.original_sculpture_id && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <LinkIcon className="w-4 h-4" />
            <span>Variation ({sculpture.creativity_level})</span>
          </div>
        )}
      </div>
      
      {showAIContent && sculpture.ai_generated_name && sculpture.ai_description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {sculpture.ai_description}
        </p>
      )}

      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {sculpture.prompt}
      </p>

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 text-xs px-2 py-0.5"
            >
              <TagIcon className="w-3 h-3" />
              <span>{tag.name}</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
