
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
    const updatedDimensions = {
      [`${prefix}height_in`]: dimensions.height ? parseFloat(dimensions.height) : null,
      [`${prefix}width_in`]: dimensions.width ? parseFloat(dimensions.width) : null,
      [`${prefix}depth_in`]: dimensions.depth ? parseFloat(dimensions.depth) : null,
      [`${prefix}height_cm`]: dimensions.height ? calculateCm(parseFloat(dimensions.height)) : null,
      [`${prefix}width_cm`]: dimensions.width ? calculateCm(parseFloat(dimensions.width)) : null,
      [`${prefix}depth_cm`]: dimensions.depth ? calculateCm(parseFloat(dimensions.depth)) : null,
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
    <div>
      {isEditingDimensions ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={dimensions.height}
              onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
              placeholder="Height (in)"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Input
              type="number"
              value={dimensions.width}
              onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
              placeholder="Width (in)"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Input
              type="number"
              value={dimensions.depth}
              onChange={(e) => setDimensions(prev => ({ ...prev, depth: e.target.value }))}
              placeholder="Depth (in)"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
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
        <div className="flex items-center justify-between border rounded-md py-0 px-3">
          <div className="flex gap-1 items-center flex-1">
            <span className="text-muted-foreground text-sm">HWD:</span>
            <Input
              readOnly
              value={formatDimensionString(height, width, depth)}
              placeholder="Enter dimensions"
              className="border-0 focus-visible:ring-0 px-0"
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
