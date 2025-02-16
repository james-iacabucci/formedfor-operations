
import { SculptureImage } from "@/components/sculpture/SculptureImage";
import { SculptureAttributes } from "./SculptureAttributes";
import { Sculpture } from "@/types/sculpture";
import { RegenerationSheet } from "@/components/sculpture/RegenerationSheet";
import { DeleteSculptureDialog } from "@/components/sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "@/components/tags/ManageTagsDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleDownload = () => {
    if (sculpture.image_url) {
      const link = document.createElement("a");
      link.href = sculpture.image_url;
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

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    navigate("/");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="w-2/3 mx-auto">
        <SculptureImage
          imageUrl={sculpture.image_url || ""}
          prompt={sculpture.prompt}
          isRegenerating={isRegenerating}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onDownload={handleDownload}
          onManageTags={() => setIsManageTagsOpen(true)}
          onRegenerate={(options) => {
            setIsRegenerationSheetOpen(true);
          }}
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
        sculptureId={sculpture.id}
        onRegenerationStart={() => setIsRegenerating(true)}
        onRegenerationComplete={() => {
          setIsRegenerating(false);
          queryClient.invalidateQueries({ queryKey: ["sculpture"] });
        }}
      />
      <DeleteSculptureDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        sculptureId={sculpture.id}
        onDelete={handleDelete}
      />
      <ManageTagsDialog
        open={isManageTagsOpen}
        onOpenChange={setIsManageTagsOpen}
        sculptureId={sculpture.id}
      />
    </div>
  );
}
