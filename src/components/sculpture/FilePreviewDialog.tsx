
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/types/sculpture";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileUpload[];
  selectedIndex: number | null;
  onPrevious: () => void;
  onNext: () => void;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  files,
  selectedIndex,
  onPrevious,
  onNext
}: FilePreviewDialogProps) {
  if (selectedIndex === null || !files[selectedIndex]) return null;
  const file = files[selectedIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{file.name}</DialogTitle>
        </DialogHeader>
        <div className="relative mt-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={file.url}
              alt={file.name}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="absolute inset-y-0 left-0 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={onNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
