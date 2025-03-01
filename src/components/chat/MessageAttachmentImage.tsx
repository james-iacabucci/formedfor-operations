
import { FileAttachment } from "./types";
import { MessageAttachmentActions } from "./MessageAttachmentActions";
import { formatFileSize } from "@/lib/utils";

interface MessageAttachmentImageProps {
  attachment: FileAttachment;
  onDownload: (e: React.MouseEvent) => void;
  onDelete?: () => void;
  onAttachToSculpture?: (category: "renderings" | "models" | "dimensions" | "other") => void;
  canDelete?: boolean;
  onPreview: () => void;
}

export function MessageAttachmentImage({ 
  attachment,
  onDownload,
  onDelete,
  onAttachToSculpture,
  canDelete,
  onPreview
}: MessageAttachmentImageProps) {
  return (
    <div className="relative inline-block max-w-xs">
      <div 
        className="group relative rounded-lg overflow-hidden border border-border cursor-pointer"
        onClick={onPreview}
      >
        <img 
          src={attachment.url} 
          alt={attachment.name}
          className="max-h-[250px] object-cover w-full"
        />
        <MessageAttachmentActions
          onDownload={onDownload}
          onDelete={onDelete}
          onAttachToSculpture={onAttachToSculpture}
          canDelete={canDelete}
        />
      </div>
      <div className="mt-1 px-1 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">
            {attachment.name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {formatFileSize(attachment.size)}
        </p>
      </div>
    </div>
  );
}
