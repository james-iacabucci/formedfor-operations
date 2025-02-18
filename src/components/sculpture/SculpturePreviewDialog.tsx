
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/sculpture";
import { ChevronLeft, ChevronRight, FileIcon } from "lucide-react";

interface SculpturePreviewDialogProps {
  files: FileUpload[];
  selectedIndex: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function SculpturePreviewDialog({
  files,
  selectedIndex,
  open,
  onOpenChange,
  onPrevious,
  onNext,
}: SculpturePreviewDialogProps) {
  if (selectedIndex === null) return null;

  const selectedFile = files[selectedIndex];
  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedFile?.name}</DialogTitle>
        </DialogHeader>
        <div className="relative mt-4">
          {files.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                onClick={onNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          {isImage(selectedFile.name) ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="object-contain w-full h-full"
              />
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
              <FileIcon className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
