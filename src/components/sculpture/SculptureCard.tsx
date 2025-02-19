
import { Card, CardContent } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";
import { SculptureInfo } from "./SculptureInfo";
import { useNavigate } from "react-router-dom";
import { SculptureCardImage } from "./SculptureCardImage";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  if (!sculpture?.id) {
    return null;
  }

  const handleDownload = () => {
    if (sculpture?.image_url) {
      const link = document.createElement("a");
      link.href = sculpture.image_url;
      link.download = `${sculpture.ai_generated_name || 'sculpture'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your image download has started.",
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted">
          <div className="absolute inset-0 z-10 transition-colors duration-300 group-hover:bg-black/5" />
          <SculptureCardImage
            imageUrl={sculpture.image_url}
            prompt={sculpture.prompt}
            onDelete={onDelete}
            onManageTags={onManageTags}
            onRegenerate={() => {}}
            onGenerateVariant={() => {}}
            onDownload={handleDownload}
            onClick={() => sculpture.image_url && navigate(`/sculpture/${sculpture.id}`)}
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
