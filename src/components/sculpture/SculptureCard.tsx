
import { Card, CardContent } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";
import { SculptureInfo } from "./SculptureInfo";
import { useNavigate } from "react-router-dom";
import { SculptureCardImage } from "./SculptureCardImage";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const queryClient = useQueryClient();

  if (!sculpture?.id) {
    return null;
  }

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't navigate if the click target is an interactive element
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

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('regenerate-image', {
        body: { sculptureId: sculpture.id }
      });

      if (error) throw error;

      toast({
        title: "Regenerating image",
        description: "Your sculpture image is being regenerated.",
      });

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast({
        title: "Error",
        description: "Could not regenerate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateVariant = async () => {
    try {
      const { data: variant, error } = await supabase
        .from('sculptures')
        .insert([
          {
            prompt: sculpture.prompt,
            user_id: sculpture.user_id,
            ai_engine: sculpture.ai_engine,
            status: "idea",
            original_sculpture_id: sculpture.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const { error: generateError } = await supabase.functions.invoke('generate-image', {
        body: { prompt: sculpture.prompt, sculptureId: variant.id }
      });

      if (generateError) throw generateError;

      toast({
        title: "Generating variant",
        description: "Your sculpture variant is being generated.",
      });

      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
    } catch (error) {
      console.error('Error generating variant:', error);
      toast({
        title: "Error",
        description: "Could not generate variant. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Download started",
        description: "Your image download has started.",
      });
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted">
          <div className="absolute inset-0 z-10 transition-colors duration-300 group-hover:bg-black/5" />
          <SculptureCardImage
            imageUrl={sculpture.image_url}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating}
            onDelete={onDelete}
            onManageTags={onManageTags}
            onRegenerate={handleRegenerate}
            onGenerateVariant={handleGenerateVariant}
            onDownload={handleDownload}
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
