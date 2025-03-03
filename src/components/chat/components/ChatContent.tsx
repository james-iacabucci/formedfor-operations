
import { Message, UploadingFile } from "../types";
import { FileList } from "../file-list/FileList";
import { MessageList } from "../MessageList";
import { Dispatch, SetStateAction } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";

interface ChatContentProps {
  activeView: "chat" | "files";
  currentThreadId?: string;
  resetScroll: number;
  uploadingFiles: UploadingFile[];
  editingMessage: Message | null;
  setEditingMessage: (message: Message | null) => void;
}

export function ChatContent({
  activeView,
  currentThreadId,
  resetScroll,
  uploadingFiles,
  editingMessage,
  setEditingMessage
}: ChatContentProps) {
  if (!currentThreadId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No thread selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === "chat" ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            <MessageList 
              threadId={currentThreadId} 
              uploadingFiles={uploadingFiles} 
              key={`${currentThreadId}-${resetScroll}`} // Force remount when topic changes
              editingMessage={editingMessage}
              setEditingMessage={setEditingMessage}
            />
          </div>
        ) : (
          <FileList threadId={currentThreadId} />
        )}
      </div>
    </div>
  );
}
