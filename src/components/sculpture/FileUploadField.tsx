
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/sculpture";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadFieldProps {
  label: string;
  files: FileUpload[];
  icon?: React.ReactNode;
  onFilesChange: (files: FileUpload[]) => void;
}

export function FileUploadField({
  label,
  files,
  icon,
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
        onChange={handleFileChange}
      />
      <div className="grid gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-2 bg-muted rounded-md"
          >
            <div className="flex items-center gap-2">
              {icon}
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                {file.name}
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
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
