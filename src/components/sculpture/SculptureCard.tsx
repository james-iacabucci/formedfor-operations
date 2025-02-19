
import { Card } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RegenerationSheet } from "./RegenerationSheet";
import { SculptureCardContent } from "./SculptureCardContent";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";

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
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const { isRegenerating, regenerateImage, generateVariant } = useSculptureRegeneration();

  if (!sculpture?.id) {
    return null;
  }

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'SELECT' ||
      target.closest('button') ||
      target.closest('select')
    ) {
      return;
    }
    
    if (sculpture.image_url) {
      navigate(`/sculpture/${sculpture.id}`);
    }
  };

  const handleDownload = () => {
    if (sculpture?.image_url) {
      const link = document.createElement("a");
      link.href = sculpture.image_url;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <Card 
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
        onClick={handleCardClick}
      >
        <SculptureCardContent
          sculpture={sculpture}
          tags={tags}
          isRegenerating={isRegenerating}
          showAIContent={showAIContent}
          onDelete={onDelete}
          onManageTags={onManageTags}
          onRegenerate={() => regenerateImage(sculpture.id)}
          onGenerateVariant={() => setIsRegenerationSheetOpen(true)}
          onDownload={handleDownload}
        />
      </Card>

      <RegenerationSheet
        open={isRegenerationSheetOpen}
        onOpenChange={setIsRegenerationSheetOpen}
        onRegenerate={(options) => generateVariant(sculpture.id, sculpture.user_id, sculpture.prompt, options)}
        isRegenerating={isRegenerating}
        defaultPrompt={sculpture.prompt}
      />
    </>
  );
}
