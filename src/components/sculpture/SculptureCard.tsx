import { format } from "date-fns";
import { ImageIcon, Trash2Icon, RefreshCwIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sculpture } from "@/types/sculpture";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SculptureCardProps {
  sculpture: Sculpture;
  onPreview: (sculpture: Sculpture) => void;
  onDelete: (sculpture: Sculpture) => void;
}

export function SculptureCard({ sculpture, onPreview, onDelete }: SculptureCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const handleRegenerate = async (creativity: 'small' | 'medium' | 'large') => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('regenerate-image', {
        body: { 
          prompt: sculpture.prompt,
          sculptureId: sculpture.id,
          creativity
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image regenerated successfully.",
      });
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-black/50 hover:bg-black/70 text-white"
                      disabled={isRegenerating}
                    >
                      <RefreshCwIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRegenerate('small')}>
                      Small Variation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRegenerate('medium')}>
                      Medium Variation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRegenerate('large')}>
                      Large Variation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          <p className="text-sm text-muted-foreground">
            {format(new Date(sculpture.created_at), "MMM d, yyyy")}
          </p>
          <p className="mt-1 font-medium line-clamp-2">{sculpture.prompt}</p>
        </div>
      </CardContent>
    </Card>
  );
}