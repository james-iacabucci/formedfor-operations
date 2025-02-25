
import { SculptureMainContent } from "./components/SculptureMainContent";
import { SculptureAttributes } from "./SculptureAttributes";
import { SculptureVariations } from "./SculptureVariations";
import { SculptureDetailHeader } from "./components/SculptureDetailHeader";
import { SculptureName } from "./components/SculptureName";
import { useRef } from "react";
import { EditableFieldRef } from "./EditableField";
import { Sculpture } from "@/types/sculpture";

interface SculptureDetailContentProps {
  sculpture: Sculpture;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
  onUpdate: () => void;
}

export function SculptureDetailContent({ 
  sculpture, 
  originalSculpture,
  tags,
  onUpdate 
}: SculptureDetailContentProps) {
  const descriptionRef = useRef<EditableFieldRef>(null);

  const handleNameUpdate = async (newName: string) => {
    // Trigger description regeneration when name is updated
    if (sculpture.image_url) {
      const response = await fetch(sculpture.image_url);
      const blob = await response.blob();
      const file = new File([blob], "sculpture.png", { type: "image/png" });
      
      // Get the description component to regenerate
      if (descriptionRef.current) {
        descriptionRef.current.regenerate(file, newName);
      }
    }
  };

  const handleRegenerate = async (): Promise<void> => {
    // Add empty async function to satisfy Promise<void> return type
    return Promise.resolve();
  };

  return (
    <div className="space-y-8">
      <div>
        <SculptureDetailHeader sculpture={sculpture} />
        <div className="mt-4">
          <SculptureName
            sculptureId={sculpture.id}
            imageUrl={sculpture.image_url}
            name={sculpture.ai_generated_name}
            onNameUpdate={handleNameUpdate}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
        <SculptureMainContent
          sculpture={sculpture}
          isRegenerating={false}
          onRegenerate={handleRegenerate}
          descriptionRef={descriptionRef}
        />
        <SculptureAttributes
          sculpture={sculpture}
          originalSculpture={originalSculpture}
          tags={tags}
        />
      </div>
      
      <SculptureVariations
        sculptureId={sculpture.id}
        prompt={sculpture.prompt}
      />
    </div>
  );
}
