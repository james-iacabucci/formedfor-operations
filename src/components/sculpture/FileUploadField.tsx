import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/sculpture";
import { Trash2, FileIcon, ImageIcon, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { SculpturePreviewDialog } from "./SculpturePreviewDialog";

interface FileUploadFieldProps {
  label: string;
  files: FileUpload[];
  icon?: React.ReactNode;
  acceptTypes?: string;
  onFilesChange: (files: FileUpload[]) => void;
}

export function FileUploadField({
  label,
  files,
  icon,
  acceptTypes,
  onFilesChange,
}: FileUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadingFile(file);
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sculpture_files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sculpture_files')
        .getPublicUrl(fileName);

      const newFile: FileUpload = {
        id: fileName,
        name: file.name,
        url: publicUrl,
        created_at: new Date().toISOString(),
      };

      onFilesChange([...files, newFile]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      setUploadingFile(null);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const handlePrevious = () => {
    if (selectedFileIndex === null) return;
    setSelectedFileIndex(selectedFileIndex > 0 ? selectedFileIndex - 1 : files.length - 1);
  };

  const handleNext = () => {
    if (selectedFileIndex === null) return;
    setSelectedFileIndex(selectedFileIndex < files.length - 1 ? selectedFileIndex + 1 : 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={isUploading}
          onClick={() => document.getElementById(`${label}-upload`)?.click()}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      <input
        id={`${label}-upload`}
        type="file"
        className="hidden"
        accept={acceptTypes}
        onChange={handleFileChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isUploading && uploadingFile && (
          <Card className="overflow-hidden">
            <div className="flex">
              <div className="w-32 h-32 flex-shrink-0 bg-muted flex items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <div className="p-4 flex-1">
                <div className="mb-2">
                  <span className="text-sm font-medium truncate block">
                    Uploading {uploadingFile.name}...
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Please wait...
                </p>
              </div>
            </div>
          </Card>
        )}

        {files.map((file, index) => (
          <Card
            key={file.id}
            className="overflow-hidden cursor-pointer group"
            onClick={() => setSelectedFileIndex(index)}
          >
            <div className="flex">
              <div className="w-32 h-32 flex-shrink-0 relative">
                {isImage(file.name) ? (
                  <img 
                    src={file.url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm hover:bg-background/80"
                  onClick={(e) => handleRemoveFile(e, file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 flex-1">
                <div className="mb-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-500 hover:underline truncate block"
                    onClick={e => e.stopPropagation()}
                  >
                    {file.name}
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded on {format(new Date(file.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SculpturePreviewDialog
        files={files}
        selectedIndex={selectedFileIndex}
        open={selectedFileIndex !== null}
        onOpenChange={(open) => !open && setSelectedFileIndex(null)}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
}
