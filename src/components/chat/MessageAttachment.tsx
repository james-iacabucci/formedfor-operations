
import { FileAttachment } from "./types";
import { useState } from "react";
import { DeleteFileDialog } from "./DeleteFileDialog";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isImageFile = attachment.type.startsWith('image/');

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

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      {isImageFile ? (
        <MessageAttachmentImage
          attachment={attachment}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onAttachToSculpture={onAttachToSculpture}
          canDelete={canDelete}
          onPreview={handlePreview}
        />
      ) : (
        <MessageAttachmentFile
          attachment={attachment}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onAttachToSculpture={onAttachToSculpture}
          canDelete={canDelete}
          onPreview={handlePreview}
        />
      )}
      <DeleteFileDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete?.();
          setShowDeleteDialog(false);
        }}
      />
    </>
  );
}
