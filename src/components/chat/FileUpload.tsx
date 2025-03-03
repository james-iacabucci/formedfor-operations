
import { ChangeEvent, ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadingFile } from "./types";

interface FileUploadProps {
  onFilesSelected: (files: UploadingFile[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  buttonProps?: ButtonProps;
  children?: ReactNode;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  multiple = true,
  accept = "*/*",
  maxSize = 20 * 1024 * 1024, // 20MB default
  maxFiles = 10,
  buttonProps,
  children,
  disabled = false
}: FileUploadProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Convert FileList to array for easier processing
    const filesArray = Array.from(fileList);
    
    // Check if too many files were selected
    if (filesArray.length > maxFiles) {
      toast.error(`You can only upload ${maxFiles} files at once`);
      e.target.value = '';
      return;
    }

    // Process each file
    const validFiles = filesArray.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max ${maxSize / (1024 * 1024)}MB)`);
        return false;
      }
      return true;
    });

    // Create UploadingFile objects for valid files
    const uploadingFiles = validFiles.map(file => {
      // Create preview URL for images
      let preview = undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      return {
        id: crypto.randomUUID(),
        file,
        progress: 0,
        preview
      };
    });

    if (uploadingFiles.length > 0) {
      onFilesSelected(uploadingFiles);
      e.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
        disabled={disabled}
      />
      <label htmlFor="file-upload">
        <Button
          type="button"
          {...buttonProps}
          onClick={(e) => e.preventDefault()}
          disabled={disabled}
          asChild
        >
          <span>{children}</span>
        </Button>
      </label>
    </div>
  );
}
