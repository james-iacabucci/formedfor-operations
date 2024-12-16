import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sculpture } from "@/types/sculpture";

interface DeleteSculptureDialogProps {
  sculpture: Sculpture | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteSculptureDialog({
  sculpture,
  onOpenChange,
  onConfirm,
}: DeleteSculptureDialogProps) {
  return (
    <AlertDialog open={sculpture !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            sculpture.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}