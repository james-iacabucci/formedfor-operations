
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMaterialFinishData } from "./useMaterialFinishData";
import { SculptureColorSelect } from "./SculptureColorSelect";

interface SculptureMaterialFinishProps {
  sculptureId: string;
  materialId: string | null;
  finishId: string | null;
  colorCode: string | null;
}

export function SculptureMaterialFinish({ 
  sculptureId, 
  materialId, 
  finishId, 
  colorCode 
}: SculptureMaterialFinishProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { materials, finishes } = useMaterialFinishData(materialId);

  const handleMaterialChange = async (newMaterialId: string) => {
    const { error } = await supabase
      .from("sculptures")
      .update({ 
        material_id: newMaterialId,
        finish_id: null,
        color_code: null
      })
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

  const handleFinishChange = async (newFinishId: string) => {
    const { error } = await supabase
      .from("sculptures")
      .update({ 
        finish_id: newFinishId,
        color_code: null
      })
      .eq("id", sculptureId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update finish",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
    toast({
      title: "Success",
      description: "Finish updated successfully",
    });
  };

  const handleColorChange = async (newColorCode: string) => {
    const { error } = await supabase
      .from("sculptures")
      .update({ color_code: newColorCode })
      .eq("id", sculptureId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update color",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
    toast({
      title: "Success",
      description: "Color updated successfully",
    });
  };

  const currentFinish = finishes?.find(f => f.id === finishId);
  const finishType = currentFinish?.code === 'cerakote' ? 'cerakote' : 
                     currentFinish?.code === 'automotive' ? 'automotive' : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Material & Finish</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Finish</label>
            <Select 
              value={finishId || ''} 
              onValueChange={handleFinishChange}
              disabled={!materialId || finishes?.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !materialId 
                    ? "Select a material first" 
                    : finishes?.length === 0 
                      ? "No finishes available" 
                      : "Select finish"
                } />
              </SelectTrigger>
              <SelectContent>
                {finishes?.map((finish) => (
                  <SelectItem key={finish.id} value={finish.id}>
                    {finish.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <SculptureColorSelect
        colorCode={colorCode}
        onColorChange={handleColorChange}
        finishType={finishType}
      />
    </div>
  );
}
