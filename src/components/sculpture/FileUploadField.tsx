
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/sculpture";
import { Trash2, FileIcon, ImageIcon, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { SculpturePreviewDialog } from "./SculpturePreviewDialog";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
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
      toast({
        title: "Success",
        description: "File uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    
    try {
      // First, delete from storage
      const { error: deleteError } = await supabase.storage
        .from('sculpture_files')
        .remove([fileId]);

      if (deleteError) {
        throw deleteError;
      }

      // Then update the files list
      onFilesChange(files.filter(f => f.id !== fileId));

      toast({
        title: "File deleted",
        description: "The file has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the file. Please try again.",
        variant: "destructive",
      });
    }
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
          {isUploading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>
      <input
        id={`${label}-upload`}
        type="file"
        className="hidden"
        accept={acceptTypes}
        onChange={handleFileChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <Card
            key={file.id}
            className="aspect-square overflow-hidden cursor-pointer group relative"
            onClick={() => setSelectedFileIndex(index)}
          >
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
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="mb-2">
                <span className="text-sm font-medium truncate block">
                  {file.name}
                </span>
              </div>
              <p className="text-xs text-white/70">
                Uploaded on {format(new Date(file.created_at), 'MM/dd/yy')}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm hover:bg-background/80"
              onClick={(e) => handleRemoveFile(e, file.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
