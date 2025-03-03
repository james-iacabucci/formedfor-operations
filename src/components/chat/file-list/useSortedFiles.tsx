
import { useMemo } from "react";
import { ExtendedFileAttachment } from "../types";
import { SortBy, SortOrder } from "./SortControls";

export function useSortedFiles(
  files: ExtendedFileAttachment[],
  sortBy: SortBy,
  sortOrder: SortOrder
) {
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "modified":
        case "uploaded":
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case "user":
          comparison = (a.user?.username || "").localeCompare(b.user?.username || "");
          break;
        default:
          return 0;
      }
      
      // Apply sort order direction
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [files, sortBy, sortOrder]);

  return sortedFiles;
}
