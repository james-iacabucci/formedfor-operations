
import { ArchiveDeleteDialog } from "@/components/common/ArchiveDeleteDialog";

interface VariantDeleteDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  onArchive: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  isLastVariant?: boolean;
}

export function VariantDeleteDialog({
  showDialog,
  setShowDialog,
  onArchive,
  onDelete,
  isLoading = false,
  isLastVariant = false
}: VariantDeleteDialogProps) {
  return (
    <ArchiveDeleteDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      title="Manage Sculpture Variant"
      description={isLastVariant 
        ? "You cannot delete the last variant of a sculpture. Please create another variant first."
        : "You can either archive this variant or permanently delete it. Archived variants can be restored later."}
      onArchive={onArchive}
      onDelete={onDelete}
      isLoading={isLoading}
      disableActions={isLastVariant}
    />
  );
}
