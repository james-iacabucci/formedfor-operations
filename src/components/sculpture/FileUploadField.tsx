
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/sculpture";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
    }
  };

  const handleRemoveFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
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
      <div className="grid gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-2 bg-muted rounded-md"
          >
            <div className="flex items-center gap-3">
              {isImage(file.name) ? (
                <div className="w-8 h-8 rounded overflow-hidden bg-background flex-shrink-0">
                  <img 
                    src={file.url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-background flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline block truncate"
                >
                  {file.name}
                </a>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(file.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 flex-shrink-0"
              onClick={() => handleRemoveFile(file.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
