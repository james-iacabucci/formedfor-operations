
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";
import { FileAttachment } from "./types";
import { format } from "date-fns";

interface MessageAttachmentProps {
  attachment: FileAttachment;
}

export function MessageAttachment({ attachment }: MessageAttachmentProps) {
  const isImageFile = (type: string) => type.startsWith('image/');

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    window.open(attachment.url, '_blank');
  };

  if (isImageFile(attachment.type)) {
    return (
      <div className="group relative inline-block max-w-sm">
        <div 
          className="rounded-lg overflow-hidden border border-border cursor-pointer"
          onClick={handlePreview}
        >
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="max-h-[300px] object-cover w-full"
          />
        </div>
        <div className="mt-1 px-1">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{attachment.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{formatFileSize(attachment.size)}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={handleDownload}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40 hover:bg-muted/60 transition-colors max-w-md cursor-pointer group"
      onClick={handlePreview}
    >
      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{attachment.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>{formatFileSize(attachment.size)}</span>
          <span>•</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
