
import { useState, useEffect } from "react";
import { Message } from "./types";
import { MessageContentDisplay } from "./MessageContentDisplay";
import { MessageContentEditor } from "./MessageContentEditor";
import { UploadingFile } from "./types";

interface MessageContentProps {
  message: Message;
  isDeleted: boolean;
  isEditing: boolean;
  onCancelEdit: () => void;
  onSaveEdit: (content: string, attachments: any[]) => Promise<void>;
}

export function MessageContent({ 
  message, 
  isDeleted, 
  isEditing,
  onCancelEdit,
  onSaveEdit
}: MessageContentProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>(() => 
    message.attachments.map(attachment => ({
      id: crypto.randomUUID(),
      file: new File([], attachment.name, { type: attachment.type }),
      progress: 100,
      existingUrl: attachment.url
    }))
  );

  // Reset the uploadingFiles when message changes
  useEffect(() => {
    setUploadingFiles(message.attachments.map(attachment => ({
      id: crypto.randomUUID(),
      file: new File([], attachment.name, { type: attachment.type }),
      progress: 100,
      existingUrl: attachment.url
    })));
  }, [message.attachments]);

  // Regular view
  if (!isEditing) {
    return <MessageContentDisplay message={message} isDeleted={isDeleted} />;
  }

  // Edit mode
  return (
    <MessageContentEditor
      initialContent={message.content}
      initialAttachments={uploadingFiles}
      onCancel={onCancelEdit}
      onSave={onSaveEdit}
    />
  );
}
