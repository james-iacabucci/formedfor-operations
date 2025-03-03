
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExtendedFileAttachment } from "../types";
import { FileCard } from "../FileCard";
import { EmptyFileList } from "./EmptyFileList";

interface FileListContentProps {
  files: ExtendedFileAttachment[];
  debugInfo?: string;
  isLoading?: boolean;
  error?: string | null;
  canDelete: (fileUserId: string) => boolean;
  onDelete: (file: ExtendedFileAttachment) => void;
  onAttachToSculpture: (file: ExtendedFileAttachment, category: "models" | "renderings" | "dimensions" | "other") => void;
}

export function FileListContent({
  files,
  debugInfo,
  isLoading,
  error,
  canDelete,
  onDelete,
  onAttachToSculpture
}: FileListContentProps) {
  if (isLoading) {
    return <EmptyFileList>Loading files...</EmptyFileList>;
  }

  if (error) {
    return <EmptyFileList>Error loading files: {error}</EmptyFileList>;
  }

  if (files.length === 0) {
    return <EmptyFileList debugInfo={debugInfo} />;
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="py-4 space-y-4">
        {files.map((file) => (
          <FileCard
            key={`${file.messageId}-${file.name}`}
            file={file}
            canDelete={canDelete(file.userId)}
            onDelete={() => onDelete(file)}
            onAttachToSculpture={(category) => onAttachToSculpture(file, category)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
