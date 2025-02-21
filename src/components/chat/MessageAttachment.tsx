
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";
import { FileAttachment } from "./types";
import { format } from "date-fns";

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
          className="max-w-[300px] max-h-[200px] rounded-lg object-cover hover:brightness-90 transition-all cursor-pointer"
          onClick={() => window.open(attachment.url, '_blank')}
        />
        <div className="opacity-0 group-hover/image:opacity-100 transition-opacity absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm truncate">{attachment.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-white hover:text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = attachment.url;
                link.download = attachment.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors max-w-md group/file cursor-pointer" onClick={() => window.open(attachment.url, '_blank')}>
      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0">
        <FileText className="h-5 w-5 text-foreground/70" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{attachment.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>{formatFileSize(attachment.size)}</span>
          <span>•</span>
          <span>{format(new Date(attachment.created_at || new Date()), 'MMM d, yyyy')}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover/file:opacity-100 transition-opacity h-8 w-8 p-0"
        onClick={(e) => {
          e.stopPropagation();
          const link = document.createElement('a');
          link.href = attachment.url;
          link.download = attachment.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
