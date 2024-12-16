import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sculpture } from "@/types/sculpture";

interface SculpturePreviewDialogProps {
  sculpture: Sculpture | null;
  onOpenChange: (open: boolean) => void;
}

export function SculpturePreviewDialog({
  sculpture,
  onOpenChange,
}: SculpturePreviewDialogProps) {
  return (
    <Dialog open={sculpture !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{sculpture?.prompt}</DialogTitle>
        </DialogHeader>
        {sculpture?.image_url && (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <img
              src={sculpture.image_url}
              alt={sculpture.prompt}
              className="object-cover"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}