
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArchiveIcon, TrashIcon } from "lucide-react";

interface VariantDeleteDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function VariantDeleteDialog({
  showDialog,
  setShowDialog,
  onArchive,
  onDelete
}: VariantDeleteDialogProps) {
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Variant</AlertDialogTitle>
          <AlertDialogDescription>
            How would you like to remove this variant?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onArchive}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <ArchiveIcon className="h-4 w-4 mr-2" />
            Archive Variant
          </AlertDialogAction>
          <AlertDialogAction 
            onClick={onDelete}
            className="bg-destructive hover:bg-destructive/90"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
