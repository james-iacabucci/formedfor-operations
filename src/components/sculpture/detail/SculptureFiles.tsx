
import { FileUploadField } from "../FileUploadField";
import { FileUpload } from "@/types/sculpture";
import { supabase } from "@/integrations/supabase/client";
import { FileIcon, ImageIcon } from "lucide-react";

interface SculptureFilesProps {
  sculptureId: string;
  models: FileUpload[];
  renderings: FileUpload[];
  dimensions: FileUpload[];
}

export function SculptureFiles({ sculptureId, models, renderings, dimensions }: SculptureFilesProps) {
  console.log('SculptureFiles - Component props:', {
    sculptureId,
    models: models?.length,
    renderings: renderings?.length,
    dimensions: dimensions?.length
  });

  const handleFilesChange = async (files: FileUpload[], type: string) => {
    console.log('handleFilesChange called with type:', type);
    const { error } = await supabase
      .from('sculptures')
      .update({ [type]: files })
      .eq('id', sculptureId);
    
    if (error) {
      console.error(`Error updating ${type}:`, error);
      return;
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Attachments</h2>
      <div className="space-y-4">
        <FileUploadField
          label="Renderings"
          files={renderings}
          icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
          acceptTypes="image/*"
          sculptureId={sculptureId}
          onFilesChange={(files) => handleFilesChange(files, 'renderings')}
        />

        <FileUploadField
          label="Models"
          files={models}
          icon={<FileIcon className="h-4 w-4 text-muted-foreground" />}
          sculptureId={sculptureId}
          onFilesChange={(files) => handleFilesChange(files, 'models')}
        />

        <FileUploadField
          label="Dimensions"
          files={dimensions}
          icon={<FileIcon className="h-4 w-4 text-muted-foreground" />}
          sculptureId={sculptureId}
          onFilesChange={(files) => handleFilesChange(files, 'dimensions')}
        />
      </div>
    </div>
  );
}
