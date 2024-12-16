import { Card, CardContent } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SculptureImage } from "./SculptureImage";
import { SculptureActions } from "./SculptureActions";
import { SculptureInfo } from "./SculptureInfo";

interface SculptureCardProps {
  sculpture: Sculpture;
  folders: Array<{ id: string; name: string }>;
  onPreview: (sculpture: Sculpture) => void;
  onDelete: (sculpture: Sculpture) => void;
  onAddToFolder: (sculpture: Sculpture) => void;
}

export function SculptureCard({
  sculpture,
  folders,
  onPreview,
  onDelete,
  onAddToFolder,
}: SculptureCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const handleRegenerate = async (creativity: "small" | "medium" | "large") => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke("regenerate-image", {
        body: {
          prompt: sculpture.prompt,
          sculptureId: sculpture.id,
          creativity,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New variation generated successfully.",
      });
    } catch (error) {
      console.error("Error regenerating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate variation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(sculpture.image_url!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sculpture-${sculpture.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      className={`group relative ${sculpture.image_url ? "cursor-pointer" : ""}`}
      onClick={(e) => {
        if (
          sculpture.image_url &&
          !(e.target as HTMLElement).closest("button")
        ) {
          onPreview(sculpture);
        }
      }}
    >
      <CardContent className="p-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <SculptureImage
            imageUrl={sculpture.image_url}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating}
            onImageClick={() => onPreview(sculpture)}
          />
          {sculpture.image_url && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <SculptureActions
                isRegenerating={isRegenerating}
                onDelete={() => onDelete(sculpture)}
                onDownload={handleDownload}
                onAddToFolder={() => onAddToFolder(sculpture)}
                onRegenerate={handleRegenerate}
              />
            </div>
          )}
        </div>
        <SculptureInfo 
          sculpture={sculpture}
          folders={folders}
        />
      </CardContent>
    </Card>
  );
}