
import { FileUploadField } from "../FileUploadField";
import { FileUpload } from "@/types/sculpture";
import { supabase } from "@/integrations/supabase/client";

interface SculptureFilesProps {
  sculptureId: string;
  models: FileUpload[];
  renderings: FileUpload[];
  dimensions: FileUpload[];
}

export function SculptureFiles({ sculptureId, models, renderings, dimensions }: SculptureFilesProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Files</h2>
      <div className="space-y-4">
        <FileUploadField
          label="Models"
          files={models}
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
          label="Renderings"
          files={renderings}
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
          label="Dimensions"
          files={dimensions}
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
