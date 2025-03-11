
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArchiveIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <AlertDialogContent className="bg-black text-white border-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold">Manage Sculpture</AlertDialogTitle>
          <AlertDialogDescription className="text-white/80 text-base">
            You can either archive this sculpture or permanently delete it and all its variations.
            Archived sculptures can be restored later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center space-x-4 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowDialog(false)}
            className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onArchive}
            className="bg-neutral-800 text-white border-none hover:bg-neutral-700 min-w-[120px]"
          >
            <ArchiveIcon className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button
            onClick={onDelete}
            className="bg-red-800 hover:bg-red-700 text-white border-none min-w-[160px]"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete Forever
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
