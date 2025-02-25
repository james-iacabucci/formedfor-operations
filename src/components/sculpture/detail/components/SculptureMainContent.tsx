
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SculptureDetailImage } from "../SculptureDetailImage";
import SculptureDescription from "./SculptureDescription";
import { SculptureFiles } from "../SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useToast } from "@/hooks/use-toast";
import { EditableFieldRef } from "../EditableField";
import { RefObject } from "react";

interface SculptureMainContentProps {
  sculpture: Sculpture;
  isRegenerating: boolean;
  onRegenerate: () => Promise<void>;
  descriptionRef: RefObject<EditableFieldRef>;
}

export function SculptureMainContent({ 
  sculpture, 
  isRegenerating, 
  onRegenerate,
  descriptionRef
}: SculptureMainContentProps) {
  const { toast } = useToast();

  const handleManageTags = () => {
    console.log("Manage tags clicked");
    toast({
      title: "Coming Soon",
      description: "Tag management will be available soon.",
    });
  };

  return (
    <div className="space-y-8">
      <AspectRatio ratio={1}>
        <SculptureDetailImage
          imageUrl={sculpture.image_url}
          prompt={sculpture.prompt}
          isRegenerating={isRegenerating}
          sculptureId={sculpture.id}
          userId={sculpture.user_id}
          onRegenerate={onRegenerate}
          hideButtons={false}
          status={sculpture.status}
          onManageTags={handleManageTags}
        />
      </AspectRatio>
      <div className="space-y-4">
        <SculptureDescription
          sculptureId={sculpture.id}
          imageUrl={sculpture.image_url}
          description={sculpture.ai_description}
          name={sculpture.ai_generated_name}
          ref={descriptionRef}
        />
        <SculptureFiles
          sculptureId={sculpture.id}
          models={sculpture.models}
          renderings={sculpture.renderings}
          dimensions={sculpture.dimensions}
        />
      </div>
    </div>
  );
}
