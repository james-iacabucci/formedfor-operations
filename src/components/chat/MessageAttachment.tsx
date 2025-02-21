
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";
import { FileAttachment } from "./types";

interface MessageAttachmentProps {
  attachment: FileAttachment;
}

export function MessageAttachment({ attachment }: MessageAttachmentProps) {
  const isImageFile = (type: string) => type.startsWith('image/');

  if (isImageFile(attachment.type)) {
    return (
      <div className="group/image relative inline-block">
        <img 
          src={attachment.url} 
          alt={attachment.name}
          className="max-w-[300px] max-h-[200px] rounded-lg object-cover border border-border hover:border-primary/50 transition-colors"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20"
              onClick={() => window.open(attachment.url, '_blank')}
            >
              View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20"
              onClick={() => {
                const link = document.createElement('a');
                link.href = attachment.url;
                link.download = attachment.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors max-w-md group/file">
      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
        <FileText className="h-5 w-5 text-foreground/70" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{attachment.name}</div>
        <div className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover/file:opacity-100 transition-opacity"
        onClick={() => {
          const link = document.createElement('a');
          link.href = attachment.url;
          link.download = attachment.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      >
        Download
      </Button>
    </div>
  );
}
