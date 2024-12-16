import { Card, CardContent } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SculptureImage } from "./SculptureImage";
import { SculptureActions } from "./SculptureActions";
import { SculptureInfo } from "./SculptureInfo";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRegenerate = async (options: {
    creativity: "none" | "small" | "medium" | "large";
    changes?: string;
    updateExisting: boolean;
    regenerateImage: boolean;
    regenerateMetadata: boolean;
  }) => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke("regenerate-image", {
        body: {
          prompt: sculpture.prompt + (options.changes ? `. Changes: ${options.changes}` : ""),
          sculptureId: sculpture.id,
          creativity: options.creativity,
          updateExisting: options.updateExisting,
          regenerateImage: options.regenerateImage,
          regenerateMetadata: options.regenerateMetadata,
        },
      });

      if (error) throw error;

      // Invalidate both the individual sculpture query and any queries that list sculptures
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });

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
          navigate(`/sculpture/${sculpture.id}`);
        }
      }}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <SculptureImage
            imageUrl={sculpture.image_url}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating}
            onImageClick={() => navigate(`/sculpture/${sculpture.id}`)}
          />
          {sculpture.image_url && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <SculptureActions
                isRegenerating={isRegenerating}
                onDelete={() => onDelete(sculpture)}
                onDownload={handleDownload}
                onManageTags={() => onManageTags(sculpture)}
                onRegenerate={handleRegenerate}
              />
            </div>
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