
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { DeleteFileDialog } from "../DeleteFileDialog";
import { SortControls, SortBy, SortOrder } from "./SortControls";
import { useFileListData } from "./hooks/useFileListData";
import { useFileActions } from "./hooks/useFileActions";
import { useSortedFiles } from "./useSortedFiles";
import { FileListContent } from "./FileListContent";
import { ExtendedFileAttachment } from "../types";

interface FileListProps {
  threadId: string;
}

export function FileList({ threadId }: FileListProps) {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortBy>("modified");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Custom hooks to separate concerns
  const { files, setFiles, debugInfo, isLoading, error } = useFileListData(threadId);
  const { deleteFile, setDeleteFile, handleDeleteFile, attachToSculpture } = useFileActions(setFiles);
  const sortedFiles = useSortedFiles(files, sortBy, sortOrder);

  // Log initial mount info
  useEffect(() => {
    console.log(`FileList mounted with threadId: ${threadId}`);
    return () => console.log("FileList unmounted");
  }, [threadId]);

  // Check if user can delete file
  const canDeleteFile = (fileUserId: string): boolean => {
    return user?.id === fileUserId;
  };

  // Handle attachment to sculpture
  const handleAttachToSculpture = (file: ExtendedFileAttachment, category: "models" | "renderings" | "dimensions" | "other") => {
    attachToSculpture(file, category, threadId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b">
        <SortControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
        />
      </div>

      <FileListContent
        files={sortedFiles}
        debugInfo={debugInfo}
        isLoading={isLoading}
        error={error}
        canDelete={canDeleteFile}
        onDelete={setDeleteFile}
        onAttachToSculpture={handleAttachToSculpture}
      />

      <DeleteFileDialog
        isOpen={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={() => handleDeleteFile(user)}
      />
    </div>
  );
}
