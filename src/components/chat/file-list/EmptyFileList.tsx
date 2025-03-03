
import { ReactNode } from "react";

interface EmptyFileListProps {
  debugInfo?: string;
  children?: ReactNode;
}

export function EmptyFileList({ debugInfo, children }: EmptyFileListProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {children || "No files have been shared in this chat yet"}
      {debugInfo && (
        <div className="mt-4 p-3 text-xs text-left border rounded bg-muted overflow-auto max-h-64">
          <h5 className="font-bold mb-2">Debug Info:</h5>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
}
