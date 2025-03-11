
import { UploadingFile } from "../types";

interface UsePasteHandlerProps {
  onUploadingFiles: (files: UploadingFile[]) => void;
}

export function usePasteHandler({ onUploadingFiles }: UsePasteHandlerProps) {
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      
      const newFiles: UploadingFile[] = await Promise.all(
        imageItems.map(async (item) => {
          const file = item.getAsFile();
          if (!file) return null;
          
          const ext = file.type.split('/')[1] || 'png';
          const newFile = new File([file], `pasted-image-${Date.now()}.${ext}`, {
            type: file.type
          });
          
          return {
            id: crypto.randomUUID(),
            file: newFile,
            progress: 0
          };
        })
      );
      
      const validFiles = newFiles.filter((file): file is UploadingFile => file !== null);
      if (validFiles.length > 0) {
        onUploadingFiles(validFiles);
      }
    }
  };

  return { handlePaste };
}
