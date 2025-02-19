
import { Button } from "@/components/ui/button";
import { DownloadIcon, PlusIcon } from "lucide-react";
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
  console.log("SculptureDetailImage rendering with isRegenerating:", isRegenerating);
  
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
      if (options.regenerateImage) {
        // Call the parent's onRegenerate instead of generating a variant
        await onRegenerate();
        return;
      }

      await generateVariant(sculptureId, userId, prompt, options);
      
      if (!options.updateExisting) {
        const { data: newSculpture, error } = await supabase
          .from("sculptures")
          .select("id")
          .eq("original_sculpture_id", sculptureId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
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

  console.log("About to render BaseSculptureImage with isRegenerating:", isRegenerating);

  return (
    <>
      <BaseSculptureImage
        imageUrl={imageUrl}
        prompt={prompt}
        isRegenerating={isRegenerating}
        className="rounded-lg"
      >
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/30 hover:bg-black/50 text-white border-0"
            onClick={() => setIsRegenerationSheetOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-black/30 hover:bg-black/50 text-white border-0"
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
