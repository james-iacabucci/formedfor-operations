
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Fetch materials from value_lists
  const { data: materials } = useQuery({
    queryKey: ["value_lists", "material"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "material");

      if (error) throw error;
      return data;
    },
  });

  // Fetch finishes from value_lists
  const { data: finishes } = useQuery({
    queryKey: ["value_lists", "finish"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("value_lists")
        .select("*")
        .eq("type", "finish");

      if (error) throw error;
      return data;
    },
  });

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

  const handleFinishChange = async (newFinishId: string) => {
    const { error } = await supabase
      .from("sculptures")
      .update({ 
        finish_id: newFinishId,
        color_code: null // Reset color when finish changes
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

  // Get the current finish type
  const currentFinish = finishes?.find(f => f.id === finishId);
  const showCerakoteColors = currentFinish?.code === 'cerakote';
  const showRALColors = currentFinish?.code === 'automotive';

  const cerakoteColors = [
    { code: 'H-146', name: 'Graphite Black' },
    { code: 'H-227', name: 'Tactical Grey' },
    { code: 'H-151', name: 'Satin Aluminum' },
    { code: 'H-237', name: 'Tungsten' },
    { code: 'H-190', name: 'Armor Black' },
    // Add more Cerakote colors as needed
  ];

  const ralColors = [
    { code: 'RAL9005', name: 'Jet Black' },
    { code: 'RAL9006', name: 'White Aluminium' },
    { code: 'RAL9007', name: 'Grey Aluminium' },
    { code: 'RAL7016', name: 'Anthracite Grey' },
    { code: 'RAL9016', name: 'Traffic White' },
    // Add more RAL colors as needed
  ];

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
            <Select value={finishId || ''} onValueChange={handleFinishChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select finish" />
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

      {(showCerakoteColors || showRALColors) && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <Select value={colorCode || ''} onValueChange={handleColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {showCerakoteColors && cerakoteColors.map((color) => (
                  <SelectItem key={color.code} value={color.code}>
                    {color.name} ({color.code})
                  </SelectItem>
                ))}
                {showRALColors && ralColors.map((color) => (
                  <SelectItem key={color.code} value={color.code}>
                    {color.name} ({color.code})
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
