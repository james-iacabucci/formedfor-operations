
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "lucide-react";
import { UploadingFile } from "./types";

interface FileUploadProps {
  disabled: boolean;
  onFilesSelected: (files: UploadingFile[]) => void;
  children?: React.ReactNode;
  buttonProps?: {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
  };
}

export function FileUpload({ 
  disabled, 
  onFilesSelected, 
  children, 
  buttonProps 
}: FileUploadProps) {
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
        disabled={disabled}
      />
      <Button
        type="button"
        size={buttonProps?.size || "icon"}
        variant={buttonProps?.variant || "ghost"}
        className={buttonProps?.className || "h-8 w-8 shrink-0 rounded-full"}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        {children || <PaperclipIcon className="h-4 w-4 text-muted-foreground" />}
      </Button>
    </>
  );
}
