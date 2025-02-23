
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sculpture } from "@/types/sculpture";

interface SculpturePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sculpture: Sculpture | null;
}

export function SculpturePreviewDialog({
  open,
  onOpenChange,
  sculpture
}: SculpturePreviewDialogProps) {
  if (!sculpture) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{sculpture.ai_generated_name || 'Untitled Sculpture'}</DialogTitle>
        </DialogHeader>
        <div className="relative mt-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={sculpture.image_url || ''}
              alt={sculpture.prompt}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
