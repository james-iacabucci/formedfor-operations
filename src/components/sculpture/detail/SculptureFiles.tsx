
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
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Attachments</h2>
      <div className="space-y-4">
        <FileUploadField
          label="Renderings"
          files={renderings}
          icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
          acceptTypes="image/*"
          onFilesChange={async (files) => {
            const { error } = await supabase
              .from('sculptures')
              .update({ renderings: files })
              .eq('id', sculptureId);
            
            if (error) {
              console.error('Error updating renderings:', error);
              return;
            }
          }}
        />

        <FileUploadField
          label="3D Models"
          files={models}
          icon={<FileIcon className="h-4 w-4 text-muted-foreground" />}
          onFilesChange={async (files) => {
            const { error } = await supabase
              .from('sculptures')
              .update({ models: files })
              .eq('id', sculptureId);
            
            if (error) {
              console.error('Error updating models:', error);
              return;
            }
          }}
        />

        <FileUploadField
          label="Specifications"
          files={dimensions}
          icon={<FileIcon className="h-4 w-4 text-muted-foreground" />}
          onFilesChange={async (files) => {
            const { error } = await supabase
              .from('sculptures')
              .update({ dimensions: files })
              .eq('id', sculptureId);
            
            if (error) {
              console.error('Error updating dimensions:', error);
              return;
            }
          }}
        />
      </div>
    </div>
  );
}
