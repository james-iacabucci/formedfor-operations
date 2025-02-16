
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenIcon, CheckIcon, XIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SculptureDimensionsProps {
  sculptureId: string;
  height: number | null;
  width: number | null;
  depth: number | null;
}

export function SculptureDimensions({ sculptureId, height, width, depth }: SculptureDimensionsProps) {
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  const [dimensions, setDimensions] = useState({
    height: height?.toString() || "",
    width: width?.toString() || "",
    depth: depth?.toString() || ""
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const calculateCm = (inches: number): number => {
    return inches * 2.54;
  };

  const formatDimensionString = (h: number | null, w: number | null, d: number | null, unit: string) => {
    if (!h && !w && !d) return "No dimensions set";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return unit === 'cm' ? val.toFixed(2) : val;
    };
    
    return `${formatValue(h)}h - ${formatValue(w)}w - ${formatValue(d)}d`;
  };

  const handleDimensionsUpdate = async () => {
    const updatedDimensions = {
      height_in: dimensions.height ? parseFloat(dimensions.height) : null,
      width_in: dimensions.width ? parseFloat(dimensions.width) : null,
      depth_in: dimensions.depth ? parseFloat(dimensions.depth) : null,
    };

    const { error } = await supabase
      .from('sculptures')
      .update(updatedDimensions)
      .eq('id', sculptureId);

    if (error) {
      console.error('Error updating dimensions:', error);
      toast({
        title: "Error",
        description: "Failed to update dimensions",
        variant: "destructive",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
    
    toast({
      title: "Success",
      description: "Dimensions updated successfully",
    });
    
    setIsEditingDimensions(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Dimensions</label>
      <div className="space-y-4">
        {isEditingDimensions ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Inches</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="Height"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="Width"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Input
                  type="number"
                  value={dimensions.depth}
                  onChange={(e) => setDimensions(prev => ({ ...prev, depth: e.target.value }))}
                  placeholder="Depth"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleDimensionsUpdate}
                size="sm"
                variant="ghost"
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDimensions({
                    height: height?.toString() || "",
                    width: width?.toString() || "",
                    depth: depth?.toString() || ""
                  });
                  setIsEditingDimensions(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between border rounded-md py-2 px-3">
              <div className="flex items-center gap-4">
                <div className="text-sm space-x-3">
                  <span>
                    {formatDimensionString(height, width, depth, "in")} (in)
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground">
                    {formatDimensionString(
                      height ? calculateCm(height) : null,
                      width ? calculateCm(width) : null,
                      depth ? calculateCm(depth) : null,
                      "cm"
                    )} (cm)
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDimensions(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <PenIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
