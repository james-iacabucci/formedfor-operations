
import { SculptureImage } from "../detail/SculptureImage";
import { SculptureAttributes } from "./SculptureAttributes";
import { SculptureFiles } from "./SculptureFiles";
import { Sculpture } from "@/types/sculpture";
import { RegenerationSheet } from "@/components/sculpture/RegenerationSheet";
import { DeleteSculptureDialog } from "@/components/sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "@/components/tags/ManageTagsDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface SculptureDetailContentProps {
  sculpture: Sculpture;
  originalSculpture: Sculpture | null;
  tags: Array<{ id: string; name: string }>;
}

export function SculptureDetailContent({
  sculpture,
  originalSculpture,
  tags,
}: SculptureDetailContentProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegenerationSheetOpen, setIsRegenerationSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRegenerate = async (options: any) => {
    setIsRegenerating(true);
    try {
      // Add your regeneration logic here
      await queryClient.invalidateQueries({ queryKey: ["sculpture"] });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="w-full space-y-6">
        <AspectRatio ratio={1}>
          <SculptureImage
            imageUrl={sculpture.image_url || ""}
            prompt={sculpture.prompt}
            isRegenerating={isRegenerating}
            onManageTags={() => setIsManageTagsOpen(true)}
            onRegenerate={() => setIsRegenerationSheetOpen(true)}
          />
        </AspectRatio>
        <SculptureFiles
          sculptureId={sculpture.id}
          models={sculpture.models}
          renderings={sculpture.renderings}
          dimensions={sculpture.dimensions}
        />
      </div>
      <SculptureAttributes
        sculpture={sculpture}
        originalSculpture={originalSculpture}
        tags={tags}
      />
      <RegenerationSheet
        open={isRegenerationSheetOpen}
        onOpenChange={setIsRegenerationSheetOpen}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />
      <DeleteSculptureDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        sculpture={sculpture}
      />
      <ManageTagsDialog
        open={isManageTagsOpen}
        onOpenChange={setIsManageTagsOpen}
        sculpture={sculpture}
      />
    </div>
  );
}
