
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/sculpture";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      // Get file size before upload
      const fileSize = file.size;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sculpture_files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sculpture_files')
        .getPublicUrl(fileName);

      const { data: { user } } = await supabase.auth.getUser();

      const newFile: FileUpload = {
        id: fileName,
        name: file.name,
        url: publicUrl,
        created_at: new Date().toISOString(),
        size: fileSize,
        uploaded_by: user?.email || 'Unknown',
      };

      onFilesChange([...files, newFile]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
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
        {files.map((file) => (
          <Card
            key={file.id}
            className="flex overflow-hidden"
          >
            <div className="flex-grow p-4">
              <div className="flex items-center gap-2 mb-2">
                {!isImage(file.name) && icon}
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-500 hover:underline truncate"
                >
                  {file.name}
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Uploaded on {format(new Date(file.created_at), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Size: {formatFileSize(file.size)}
                </p>
                <p className="text-xs text-muted-foreground">
                  By: {file.uploaded_by || 'Unknown'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => handleRemoveFile(file.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
            {isImage(file.name) && (
              <div className="w-32 h-32 flex-shrink-0 border-l">
                <img 
                  src={file.url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
