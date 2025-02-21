
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "lucide-react";
import { UploadingFile } from "./types";

interface FileUploadProps {
  disabled: boolean;
  onFilesSelected: (files: UploadingFile[]) => void;
}

export function FileUpload({ disabled, onFilesSelected }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const newFiles = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0
    }));
    onFilesSelected(newFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
        disabled={disabled}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
    </>
  );
}
