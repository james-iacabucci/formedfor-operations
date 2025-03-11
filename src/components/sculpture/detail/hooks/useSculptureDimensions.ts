import { useState, useEffect, useRef } from "react";
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
  const [isSaving, setIsSaving] = useState(false);
  const [dimensions, setDimensions] = useState<DimensionsState>({
    height: height?.toString() || "",
    width: width?.toString() || "",
    depth: depth?.toString() || ""
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditingDimensions && !isSaving) {
      setDimensions({
        height: height?.toString() || "",
        width: width?.toString() || "",
        depth: depth?.toString() || ""
      });
    }
  }, [height, width, depth, isEditingDimensions, isSaving]);

  const formatDimensionsString = (h: number | null, w: number | null, d: number | null) => {
    if (!h && !w && !d) return "";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val.toString();
    };
    
    return `${formatValue(h)} × ${formatValue(w)} × ${formatValue(d)} in`;
  };

  const handleDimensionsUpdate = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const prefix = isBase ? 'base_' : '';
      
      const updatedDimensions = {
        [`${prefix}height_in`]: dimensions.height ? parseFloat(dimensions.height) : null,
        [`${prefix}width_in`]: dimensions.width ? parseFloat(dimensions.width) : null,
        [`${prefix}depth_in`]: dimensions.depth ? parseFloat(dimensions.depth) : null,
      };

      if ((isQuoteForm || isVariantForm) && onDimensionsChange) {
        if (dimensions.height) onDimensionsChange(`${prefix}heightIn`, parseFloat(dimensions.height));
        if (dimensions.width) onDimensionsChange(`${prefix}widthIn`, parseFloat(dimensions.width));
        if (dimensions.depth) onDimensionsChange(`${prefix}depthIn`, parseFloat(dimensions.depth));
      }
      
      if (isVariantForm && variantId) {
        const { error } = await supabase
          .from('sculpture_variants')
          .update(updatedDimensions)
          .eq('id', variantId);
          
        if (error) throw error;
        
        setIsEditingDimensions(false);
        
        await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
        await queryClient.refetchQueries({ queryKey: ["sculpture-variants", sculptureId] });
      } else if (!isQuoteForm) {
        const { error } = await supabase
          .from('sculptures')
          .update(updatedDimensions)
          .eq('id', sculptureId);
          
        if (error) throw error;

        setIsEditingDimensions(false);

        await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
        await queryClient.refetchQueries({ queryKey: ["sculpture", sculptureId] });
      } else {
        setIsEditingDimensions(false);
      }
      
      if (isMounted.current) {
        toast({
          title: "Success",
          description: "Dimensions updated successfully",
        });
      }
    } catch (err) {
      console.error('Error updating dimensions:', err);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to update dimensions",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
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
    isSaving,
  };
}
