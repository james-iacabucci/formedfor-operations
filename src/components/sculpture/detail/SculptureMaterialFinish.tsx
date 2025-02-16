
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMaterialFinishData } from "./useMaterialFinishData";

interface SculptureMaterialFinishProps {
  sculptureId: string;
  materialId: string | null;
}

export function SculptureMaterialFinish({ 
  sculptureId, 
  materialId
}: SculptureMaterialFinishProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { materials } = useMaterialFinishData(materialId);

  const handleMaterialChange = async (newMaterialId: string) => {
    const { error } = await supabase
      .from("sculptures")
      .update({ material_id: newMaterialId })
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Material</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Material</label>
            <Select value={materialId || ''} onValueChange={handleMaterialChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials?.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
