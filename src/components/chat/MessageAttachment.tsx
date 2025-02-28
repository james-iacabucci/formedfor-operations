
import { FileAttachment } from "./types";
import { MessageAttachmentImage } from "./MessageAttachmentImage";
import { MessageAttachmentFile } from "./MessageAttachmentFile";
import { downloadFile } from "@/lib/fileUtils";
import { toast } from "sonner";

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
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Show loading toast
      toast.loading(`Downloading ${attachment.name}...`);
      
      // Use our utility function to download the file
      await downloadFile(attachment.url, attachment.name);
      
      // Show success toast
      toast.dismiss();
      toast.success(`Downloaded ${attachment.name}`);
    } catch (error) {
      // Show error toast
      toast.dismiss();
      toast.error(`Failed to download ${attachment.name}`);
      console.error("Download error:", error);
    }
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
