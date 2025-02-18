
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMaterialFinishData } from "./useMaterialFinishData";

interface SculptureMaterialFinishProps {
  sculptureId: string;
  materialId: string | null;
  isBase?: boolean;
}

export function SculptureMaterialFinish({ 
  sculptureId, 
  materialId,
  isBase = false
}: SculptureMaterialFinishProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { materials } = useMaterialFinishData(materialId);

  const handleMaterialChange = async (newMaterialId: string) => {
    const fieldName = isBase ? 'base_material_id' : 'material_id';
    const { error } = await supabase
      .from("sculptures")
      .update({ [fieldName]: newMaterialId })
      .eq("id", sculptureId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update material",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
    toast({
      title: "Success",
      description: "Material updated successfully",
    });
  };

  const selectedMaterial = materials?.find(m => m.id === materialId)?.name || '';

  return (
    <Select value={materialId || ''} onValueChange={handleMaterialChange}>
      <SelectTrigger>
        <div className="flex gap-1 items-center">
          <span className="text-muted-foreground">Material:</span>
          <SelectValue placeholder="Select material">
            {selectedMaterial}
          </SelectValue>
        </div>
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
