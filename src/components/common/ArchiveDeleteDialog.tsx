
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArchiveIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArchiveDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onArchive: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  disableActions?: boolean;
}

export function ArchiveDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onArchive,
  onDelete,
  isLoading = false,
  disableActions = false
}: ArchiveDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-black text-white border-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-white/80 text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center space-x-4 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white min-w-[120px]"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onArchive}
            className="bg-neutral-800 text-white border-none hover:bg-neutral-700 min-w-[120px]"
            disabled={isLoading || disableActions}
          >
            <ArchiveIcon className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button
            onClick={onDelete}
            className="bg-red-800 hover:bg-red-700 text-white border-none min-w-[160px]"
            disabled={isLoading || disableActions}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete Forever
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
