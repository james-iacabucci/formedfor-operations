
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenIcon, CheckIcon, XIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface SculptureDimensionsProps {
  sculptureId: string;
  height: number | null;
  width: number | null;
  depth: number | null;
  isBase?: boolean;
}

export function SculptureDimensions({ sculptureId, height, width, depth, isBase = false }: SculptureDimensionsProps) {
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

  const formatDimensionString = (h: number | null, w: number | null, d: number | null) => {
    if (!h && !w && !d) return "";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val;
    };
    
    const formatValueCm = (val: number | null) => {
      if (val === null) return '-';
      return (val * 2.54).toFixed(1);
    };
    
    const imperial = `${formatValue(h)} x ${formatValue(w)} x ${formatValue(d)} (in)`;
    const metric = `${formatValueCm(h)} x ${formatValueCm(w)} x ${formatValueCm(d)} (cm)`;
    
    return `${imperial} | ${metric}`;
  };

  const handleDimensionsUpdate = async () => {
    const prefix = isBase ? 'base_' : '';
    
    // Prepare the update object with direct values, not calculations
    const updatedDimensions: Record<string, number | null> = {
      [`${prefix}height_in`]: dimensions.height ? parseFloat(dimensions.height) : null,
      [`${prefix}width_in`]: dimensions.width ? parseFloat(dimensions.width) : null,
      [`${prefix}depth_in`]: dimensions.depth ? parseFloat(dimensions.depth) : null,
    };
    
    // Don't include cm values in the update, they are calculated by a database trigger or function
    console.log("Updating dimensions:", updatedDimensions);

    const { error } = await supabase
      .from('sculptures')
      .update(updatedDimensions)
      .eq('id', sculptureId);

    if (error) {
      console.error('Error updating dimensions:', error);
      toast({
        title: "Error",
        description: "Failed to update dimensions: " + error.message,
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
    <div>
      {isEditingDimensions ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="height-input">Height</Label>
              <Input
                id="height-input"
                type="number"
                placeholder="Height"
                value={dimensions.height}
                onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width-input">Width</Label>
              <Input
                id="width-input"
                type="number"
                placeholder="Width"
                value={dimensions.width}
                onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth-input">Depth</Label>
              <Input
                id="depth-input"
                type="number"
                placeholder="Depth"
                value={dimensions.depth}
                onChange={(e) => setDimensions(prev => ({ ...prev, depth: e.target.value }))}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
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
              <XIcon className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleDimensionsUpdate}
              size="sm"
              variant="default"
            >
              <CheckIcon className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border rounded-md py-0 px-3">
          <div className="flex gap-1 items-center flex-1">
            <span className="text-muted-foreground text-sm">HWD:</span>
            <Input
              readOnly
              value={formatDimensionString(height, width, depth)}
              placeholder="Enter dimensions"
              className={`border-0 focus-visible:ring-0 px-0 ${!height && !width && !depth ? 'placeholder:text-white' : ''}`}
              onClick={() => setIsEditingDimensions(true)}
            />
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
      )}
    </div>
  );
}
