
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UseSculptureDimensionsProps {
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

interface DimensionsState {
  height: string;
  width: string;
  depth: string;
}

export function useSculptureDimensions({
  sculptureId,
  height,
  width,
  depth,
  isBase = false,
  isQuoteForm = false,
  isVariantForm = false,
  variantId,
  onDimensionsChange,
}: UseSculptureDimensionsProps) {
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  const [dimensions, setDimensions] = useState<DimensionsState>({
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
          setIsEditingDimensions(false);
        } catch (err) {
          console.error('Error updating variant dimensions:', err);
          toast({
            title: "Error",
            description: "Failed to update dimensions in database",
            variant: "destructive",
          });
          return; // Don't close form on error
        }
      } else {
        setIsEditingDimensions(false);
      }
      
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
        return; // Don't close form on error
      }

      // Invalidate sculpture query to refresh data
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      await queryClient.refetchQueries({ queryKey: ["sculpture", sculptureId] });
      
      toast({
        title: "Success",
        description: "Dimensions updated successfully",
      });
      
      // Close the editing form
      setIsEditingDimensions(false);
    } catch (err) {
      console.error('Exception updating dimensions:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating dimensions",
        variant: "destructive",
      });
      // Don't close form on error
    }
  };

  const handleCancel = () => {
    setDimensions({
      height: height?.toString() || "",
      width: width?.toString() || "",
      depth: depth?.toString() || ""
    });
    setIsEditingDimensions(false);
  };

  return {
    isEditingDimensions,
    dimensions,
    formatDimensionsString,
    handleDimensionsUpdate,
    setDimensions,
    handleCancel,
    setIsEditingDimensions,
  };
}
