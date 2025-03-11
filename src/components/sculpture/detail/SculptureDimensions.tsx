
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenIcon, CheckIcon, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SculptureDimensionsProps {
  sculptureId: string;
  height: number | null;
  width: number | null;
  depth: number | null;
  isBase?: boolean;
  isQuoteForm?: boolean;
  isVariantForm?: boolean;
  variantId?: string;
  onDimensionsChange?: (field: string, value: number | null) => void;
}

export function SculptureDimensions({ 
  sculptureId, 
  height, 
  width, 
  depth, 
  isBase = false,
  isQuoteForm = false,
  isVariantForm = false,
  variantId,
  onDimensionsChange
}: SculptureDimensionsProps) {
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  const [dimensions, setDimensions] = useState({
    height: height?.toString() || "",
    width: width?.toString() || "",
    depth: depth?.toString() || ""
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    if (!isEditingDimensions) {
      setDimensions({
        height: height?.toString() || "",
        width: width?.toString() || "",
        depth: depth?.toString() || ""
      });
    }
  }, [height, width, depth, isEditingDimensions]);

  const formatDimensionsString = (h: number | null, w: number | null, d: number | null) => {
    if (!h && !w && !d) return "";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val.toString();
    };
    
    return `${formatValue(h)} × ${formatValue(w)} × ${formatValue(d)} in`;
  };

  const handleDimensionsUpdate = async () => {
    const prefix = isBase ? 'base_' : '';
    
    const updatedDimensions = {
      [`${prefix}height_in`]: dimensions.height ? parseFloat(dimensions.height) : null,
      [`${prefix}width_in`]: dimensions.width ? parseFloat(dimensions.width) : null,
      [`${prefix}depth_in`]: dimensions.depth ? parseFloat(dimensions.depth) : null,
    };

    if ((isQuoteForm || isVariantForm) && onDimensionsChange) {
      // In form mode, update the parent form state
      if (dimensions.height) onDimensionsChange(`${prefix}heightIn`, parseFloat(dimensions.height));
      if (dimensions.width) onDimensionsChange(`${prefix}widthIn`, parseFloat(dimensions.width));
      if (dimensions.depth) onDimensionsChange(`${prefix}depthIn`, parseFloat(dimensions.depth));
      
      // For variant form, also save to the database
      if (isVariantForm && variantId) {
        try {
          const { error } = await supabase
            .from('sculpture_variants')
            .update(updatedDimensions)
            .eq('id', variantId);
            
          if (error) throw error;
          
          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
        } catch (err) {
          console.error('Error updating variant dimensions:', err);
          toast({
            title: "Error",
            description: "Failed to update dimensions in database",
            variant: "destructive",
          });
        }
      }
      
      setIsEditingDimensions(false);
      return;
    }

    try {
      let error;
      
      // In direct edit mode, update the database
      if (isVariantForm && variantId) {
        // Update the sculpture_variants table for variants
        const { error: variantError } = await supabase
          .from('sculpture_variants')
          .update(updatedDimensions)
          .eq('id', variantId);
        error = variantError;
        
        // Invalidate variant queries
        await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
      } else {
        // Update the sculptures table
        const { error: sculptureError } = await supabase
          .from('sculptures')
          .update(updatedDimensions)
          .eq('id', sculptureId);
        error = sculptureError;
      }

      if (error) {
        console.error('Error updating dimensions:', error);
        toast({
          title: "Error",
          description: "Failed to update dimensions: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // Invalidate sculpture query to refresh data
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      
      toast({
        title: "Success",
        description: "Dimensions updated successfully",
      });
    } catch (err) {
      console.error('Exception updating dimensions:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating dimensions",
        variant: "destructive",
      });
    } finally {
      setIsEditingDimensions(false);
    }
  };

  return (
    <div>
      {isEditingDimensions ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="height-input">Height (in)</Label>
              <Input
                id="height-input"
                type="number"
                value={dimensions.height}
                onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                placeholder="Height"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width-input">Width (in)</Label>
              <Input
                id="width-input"
                type="number"
                value={dimensions.width}
                onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                placeholder="Width"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth-input">Depth (in)</Label>
              <Input
                id="depth-input"
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
            <span className="text-muted-foreground text-sm">Dimensions:</span>
            <Input
              readOnly
              value={formatDimensionsString(height, width, depth)}
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
