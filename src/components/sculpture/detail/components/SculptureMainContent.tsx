
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SculptureDetailImage } from "../SculptureDetailImage";
import { SculptureDescription } from "./SculptureDescription";
import { SculptureFiles } from "../SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

interface SculptureMainContentProps {
  sculpture: Sculpture;
  isRegenerating: boolean;
  onRegenerate: () => Promise<void>;
  onNameChanged?: (newName: string) => void;
}

export function SculptureMainContent({ 
  sculpture, 
  isRegenerating, 
  onRegenerate,
  onNameChanged
}: SculptureMainContentProps) {
  const { toast } = useToast();
  const descriptionComponentRef = useRef<HTMLDivElement>(null);

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
      <div className="space-y-6">
        <div ref={descriptionComponentRef}>
          <SculptureDescription
            sculptureId={sculpture.id}
            imageUrl={sculpture.image_url}
            description={sculpture.ai_description}
            name={sculpture.ai_generated_name}
          />
        </div>
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
