
import { Button } from "@/components/ui/button";
import { DownloadIcon, RefreshCwIcon, PlusIcon } from "lucide-react";
import { BaseSculptureImage } from "../BaseSculptureImage";
import { useState } from "react";
import { RegenerationSheet } from "../RegenerationSheet";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSculptureRegeneration } from "@/hooks/use-sculpture-regeneration";
import { supabase } from "@/integrations/supabase/client";

interface SculptureDetailImageProps {
  imageUrl: string;
  prompt: string;
  isRegenerating: boolean;
  sculptureId: string;
  userId: string;
  onRegenerate: () => Promise<void>;
}

export function SculptureDetailImage({
  imageUrl,
  prompt,
  isRegenerating,
  sculptureId,
  userId,
  onRegenerate,
}: SculptureDetailImageProps) {
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateVariant } = useSculptureRegeneration();

  const handleGenerateVariant = async (options: {
    creativity: "none" | "small" | "medium" | "large";
    changes?: string;
    updateExisting: boolean;
    regenerateImage: boolean;
    regenerateMetadata: boolean;
  }) => {
    try {
      await generateVariant(sculptureId, userId, prompt, options);
      
      if (!options.updateExisting) {
        // Query for the most recently created variation
        const { data: newSculpture, error } = await supabase
          .from("sculptures")
          .select("id")
          .eq("original_sculpture_id", sculptureId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        // Navigate to the new sculpture's detail page
        navigate(`/sculpture/${newSculpture.id}`);
      }
    } catch (error) {
      console.error("Error generating variant:", error);
      toast({
        title: "Error",
        description: "Failed to generate variant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "sculpture.png";
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
    <>
      <BaseSculptureImage
        imageUrl={imageUrl}
        prompt={prompt}
        isRegenerating={isRegenerating}
      >
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white"
            disabled={isRegenerating}
            onClick={onRegenerate}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={() => setIsRegenerationSheetOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={handleDownload}
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </BaseSculptureImage>

      <RegenerationSheet
        open={isRegenerationSheetOpen}
        onOpenChange={setIsRegenerationSheetOpen}
        onRegenerate={handleGenerateVariant}
        isRegenerating={isRegenerating}
        defaultPrompt={prompt}
      />
    </>
  );
}
