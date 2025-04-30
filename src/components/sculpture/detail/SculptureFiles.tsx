
import { useQueryClient } from "@tanstack/react-query";
import { FileUploadField } from "../FileUploadField";
import { FileUpload } from "@/types/sculpture";
import { supabase } from "@/integrations/supabase/client";
import { FileIcon, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SculptureFilesProps {
  sculptureId: string;
  models: FileUpload[];
  renderings: FileUpload[];
  dimensions: FileUpload[];
  variantId?: string | null;
}

export function SculptureFiles({ sculptureId, models = [], renderings = [], dimensions = [], variantId }: SculptureFilesProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  console.log('SculptureFiles - Component props:', {
    sculptureId,
    variantId,
    models: models?.length || 0,
    renderings: renderings?.length || 0,
    dimensions: dimensions?.length || 0
  });

  const handleFilesChange = async (files: FileUpload[], type: string) => {
    console.log('handleFilesChange called with type:', type);
    try {
      // If it's a model file, store it with the sculpture
      // If it's renderings or dimensions, store it with the variant if available
      if (type === 'models' || !variantId) {
        const { error } = await supabase
          .from('sculptures')
          .update({ [type]: files })
          .eq('id', sculptureId);
        
        if (error) {
          console.error(`Error updating ${type}:`, error);
          toast({
            title: "Update failed",
            description: `Failed to update ${type}. Please try again.`,
            variant: "destructive",
          });
          return;
        }
        
        // Invalidate the sculpture query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      } else {
        // Update the variant with the new files
        const { error } = await supabase
          .from('sculpture_variants')
          .update({ [type]: files })
          .eq('id', variantId);
        
        if (error) {
          console.error(`Error updating variant ${type}:`, error);
          toast({
            title: "Update failed",
            description: `Failed to update variant ${type}. Please try again.`,
            variant: "destructive",
          });
          return;
        }
        
        // Invalidate the variant query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
      }
    } catch (err) {
      console.error(`Exception updating ${type}:`, err);
      toast({
        title: "Update failed",
        description: `An error occurred while updating ${type}.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Attachments</h2>
      <div className="space-y-4">
        <FileUploadField
          label="Renderings"
          files={renderings || []}
          icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
          acceptTypes="image/*"
          sculptureId={sculptureId}
          onFilesChange={(files) => handleFilesChange(files, 'renderings')}
        />

        <FileUploadField
          label="Models"
          files={models || []}
          icon={<FileIcon className="h-4 w-4 text-muted-foreground" />}
          sculptureId={sculptureId}
          onFilesChange={(files) => handleFilesChange(files, 'models')}
        />

        <FileUploadField
          label="Dimensions"
          files={dimensions || []}
          icon={<FileIcon className="h-4 w-4 text-muted-foreground" />}
          sculptureId={sculptureId}
          onFilesChange={(files) => handleFilesChange(files, 'dimensions')}
        />
      </div>
    </div>
  );
}
