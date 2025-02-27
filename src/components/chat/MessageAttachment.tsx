
import { FileAttachment } from "./types";
import { MessageAttachmentImage } from "./MessageAttachmentImage";
import { MessageAttachmentFile } from "./MessageAttachmentFile";

interface MessageAttachmentProps {
  attachment: FileAttachment;
  onDelete?: () => void;
  onAttachToSculpture?: (category: "renderings" | "models" | "dimensions" | "other") => void;
  canDelete?: boolean;
}

export function MessageAttachment({ 
  attachment, 
  onDelete,
  onAttachToSculpture,
  canDelete = false 
}: MessageAttachmentProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a temporary anchor element for download
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

  const isImageFile = attachment.type.startsWith('image/');

  return isImageFile ? (
    <MessageAttachmentImage
      attachment={attachment}
      onDownload={handleDownload}
      onDelete={onDelete}
      onAttachToSculpture={onAttachToSculpture}
      canDelete={canDelete}
      onPreview={handlePreview}
    />
  ) : (
    <MessageAttachmentFile
      attachment={attachment}
      onDownload={handleDownload}
      onDelete={onDelete}
      onAttachToSculpture={onAttachToSculpture}
      canDelete={canDelete}
      onPreview={handlePreview}
    />
  );
}
