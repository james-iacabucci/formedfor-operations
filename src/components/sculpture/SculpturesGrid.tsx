
import { Sculpture } from "@/types/sculpture";
import { SculptureCard } from "./SculptureCard";

interface SculpturesGridProps {
  sculptures: Sculpture[];
  tags: Array<{ id: string; name: string; }> | undefined;
  sculptureTagRelations: Array<{ sculpture_id: string; tag_id: string; }> | undefined;
  onDelete: (sculpture: Sculpture) => void;
  onManageTags: (sculpture: Sculpture) => void;
  onSculptureClick: (sculptureId: string) => void;
}

export function SculpturesGrid({ 
  sculptures, 
  tags, 
  sculptureTagRelations,
  onDelete,
  onManageTags,
  onSculptureClick
}: SculpturesGridProps) {
  return (
    <div className="grid animate-fade-in grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sculptures.map((sculpture) => {
        const sculptureSpecificTags = tags?.filter(tag => 
          sculptureTagRelations?.some(relation => 
            relation.sculpture_id === sculpture.id && relation.tag_id === tag.id
          )
        ) || [];

        return (
          <SculptureCard 
            key={sculpture.id} 
            sculpture={sculpture}
            tags={sculptureSpecificTags}
            onDelete={() => onDelete(sculpture)}
            onManageTags={() => onManageTags(sculpture)}
            onClick={() => onSculptureClick(sculpture.id)}
          />
        );
      })}
    </div>
  );
}
