
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMaterialFinishData } from "./useMaterialFinishData";

interface SculptureMaterialFinishProps {
  sculptureId: string;
  materialId: string | null;
  isBase?: boolean;
  isQuoteForm?: boolean;
  isVariantForm?: boolean;
  variantId?: string;
  onMaterialChange?: (materialId: string) => void;
}

export function SculptureMaterialFinish({ 
  sculptureId, 
  materialId,
  isBase = false,
  isQuoteForm = false,
  isVariantForm = false,
  variantId,
  onMaterialChange
}: SculptureMaterialFinishProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { materials } = useMaterialFinishData(materialId);

  const handleMaterialChange = async (newMaterialId: string) => {
    try {
      if ((isQuoteForm || isVariantForm) && onMaterialChange) {
        // In form mode, just update the form state
        onMaterialChange(newMaterialId);
        
        if (!isVariantForm) return;
      }

      let error;
      const fieldName = isBase ? 'base_material_id' : 'material_id';
      
      if (isVariantForm && variantId) {
        // Update the sculpture_variants table for variants
        const { error: variantError } = await supabase
          .from('sculpture_variants')
          .update({ [fieldName]: newMaterialId })
          .eq('id', variantId);
        error = variantError;
        
        // Invalidate variant queries
        await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
      } else {
        // Update the sculptures table
        const { error: sculptureError } = await supabase
          .from("sculptures")
          .update({ [fieldName]: newMaterialId })
          .eq("id", sculptureId);
        error = sculptureError;
      }

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update material",
          variant: "destructive",
        });
        return;
      }

      // Invalidate sculpture query to refresh data
      queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      
      toast({
        title: "Success",
        description: "Material updated successfully",
      });
    } catch (err) {
      console.error('Exception updating material:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating material",
        variant: "destructive",
      });
    }
  };

  const selectedMaterial = materials?.find(m => m.id === materialId)?.name || '';

  return (
    <Select value={materialId || ''} onValueChange={handleMaterialChange}>
      <SelectTrigger className="group">
        <div className="flex gap-1 items-center">
          <span className="text-muted-foreground">Material:</span>
          <SelectValue placeholder="Select material">
            {selectedMaterial}
          </SelectValue>
        </div>
        <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </SelectTrigger>
      <SelectContent>
        {materials?.map((material) => (
          <SelectItem key={material.id} value={material.id}>
            {material.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
