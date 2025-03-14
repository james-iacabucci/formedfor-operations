
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useUserRoles } from "@/hooks/use-user-roles";

interface DeleteQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  isLoading?: boolean;
}

export function DeleteQuoteDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  isLoading = false,
}: DeleteQuoteDialogProps) {
  const { hasRole } = useUserRoles();
  const canDelete = hasRole('admin') || hasRole('fabrication');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Fabrication Quote</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this fabrication quote? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isLoading || !canDelete}
            className="gap-1"
          >
            <Trash2Icon className="h-4 w-4" />
            {isLoading ? "Deleting..." : "Delete Quote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
