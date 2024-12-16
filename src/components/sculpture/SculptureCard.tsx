import { format } from "date-fns";
import {
  ImageIcon,
  Trash2Icon,
  LinkIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  ArrowUpCircleIcon,
  DownloadIcon,
  FolderPlusIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sculpture } from "@/types/sculpture";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SculptureCardProps {
  sculpture: Sculpture;
  onPreview: (sculpture: Sculpture) => void;
  onDelete: (sculpture: Sculpture) => void;
  onAddToFolder: (sculpture: Sculpture) => void;
}

export function SculptureCard({
  sculpture,
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
      const response = await fetch(sculpture.image_url);
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

  const getCreativityIcon = (level: "small" | "medium" | "large") => {
    switch (level) {
      case "small":
        return <ArrowUpIcon className="w-4 h-4" />;
      case "medium":
        return <ArrowUpRightIcon className="w-4 h-4" />;
      case "large":
        return <ArrowUpCircleIcon className="w-4 h-4" />;
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
          {sculpture.image_url ? (
            <>
              <img
                src={sculpture.image_url}
                alt={sculpture.prompt}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(sculpture);
                    }}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToFolder(sculpture);
                    }}
                  >
                    <FolderPlusIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    disabled={isRegenerating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate("small");
                    }}
                    title="Small Variation"
                  >
                    {getCreativityIcon("small")}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    disabled={isRegenerating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate("medium");
                    }}
                    title="Medium Variation"
                  >
                    {getCreativityIcon("medium")}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70 text-white"
                    disabled={isRegenerating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate("large");
                    }}
                    title="Large Variation"
                  >
                    {getCreativityIcon("large")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span>Generating...</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {format(new Date(sculpture.created_at), "MMM d, yyyy")}
            </p>
            {sculpture.original_sculpture_id && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <LinkIcon className="w-4 h-4" />
                <span>Variation ({sculpture.creativity_level})</span>
              </div>
            )}
          </div>
          <p className="mt-1 font-medium line-clamp-2">{sculpture.prompt}</p>
        </div>
      </CardContent>
    </Card>
  );
}