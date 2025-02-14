
import { Sculpture } from "@/types/sculpture";
import { SculptureCard } from "./SculptureCard";

interface SculpturesGridProps {
  sculptures: Sculpture[];
  tags: Array<{ id: string; name: string; }> | undefined;
  sculptureTagRelations: Array<{ sculpture_id: string; tag_id: string; }> | undefined;
  onDelete: (sculpture: Sculpture) => void;
  onManageTags: (sculpture: Sculpture) => void;
}

export function SculpturesGrid({ 
  sculptures, 
  tags, 
  sculptureTagRelations,
  onDelete,
  onManageTags 
}: SculpturesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sculptures.map((sculpture) => {
        console.log("[SculpturesGrid] Processing sculpture:", sculpture.id);
        
        // Filter tags for this specific sculpture
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
            onDelete={() => {
              console.log("[SculpturesGrid] Deleting sculpture:", sculpture.id);
              onDelete(sculpture);
            }}
            onManageTags={() => onManageTags(sculpture)}
          />
        );
      })}
    </div>
  );
}
