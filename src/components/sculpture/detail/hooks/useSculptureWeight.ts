
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UseSculptureWeightProps {
  sculptureId: string;
  weightKg: number | null;
  weightLbs: number | null;
  isBase?: boolean;
  isQuoteForm?: boolean;
  isVariantForm?: boolean;
  variantId?: string;
  onWeightChange?: (field: string, value: number | null) => void;
}

interface WeightState {
  kg: string;
  lbs: string;
}

export function useSculptureWeight({
  sculptureId,
  weightKg,
  weightLbs,
  isBase = false,
  isQuoteForm = false,
  isVariantForm = false,
  variantId,
  onWeightChange,
}: UseSculptureWeightProps) {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weight, setWeight] = useState<WeightState>({
    kg: weightKg?.toString() || "",
    lbs: weightLbs?.toString() || "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    if (!isEditingWeight) {
      setWeight({
        kg: weightKg?.toString() || "",
        lbs: weightLbs?.toString() || "",
      });
    }
  }, [weightKg, weightLbs, isEditingWeight]);

  const calculateKg = (lbs: number): number => {
    return lbs / 2.20462;
  };

  const formatWeightString = (kg: number | null, lbs: number | null) => {
    if (!kg && !lbs) return "";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val.toFixed(2);
    };
    
    return `${formatValue(lbs)} (lbs)`;
  };

  const formatMetricString = (kg: number | null) => {
    if (!kg) return "";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val.toFixed(2);
    };
    
    return `| ${formatValue(kg)} (kg)`;
  };

  const handleWeightUpdate = async () => {
    try {
      const prefix = isBase ? 'base_' : '';
      const updatedWeight = {
        [`${prefix}weight_kg`]: weight.kg ? parseFloat(weight.kg) : null,
        [`${prefix}weight_lbs`]: weight.lbs ? parseFloat(weight.lbs) : null,
      };

      // Handle form updates (parent state updates)
      if ((isQuoteForm || isVariantForm) && onWeightChange) {
        // Update parent form state
        if (weight.kg) onWeightChange(`${prefix}weightKg`, parseFloat(weight.kg));
        if (weight.lbs) onWeightChange(`${prefix}weightLbs`, parseFloat(weight.lbs));
      }
      
      // Database updates for sculpture or variant
      if (isVariantForm && variantId) {
        // Update the variant record in database
        const { error } = await supabase
          .from('sculpture_variants')
          .update(updatedWeight)
          .eq('id', variantId);
          
        if (error) throw error;
        
        // Invalidate and immediately refetch all related queries
        await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
        await queryClient.refetchQueries({ queryKey: ["sculpture-variants", sculptureId] });
      } else if (!isQuoteForm) {
        // For direct sculpture updates
        const { error } = await supabase
          .from('sculptures')
          .update(updatedWeight)
          .eq('id', sculptureId);
          
        if (error) throw error;

        // Invalidate and immediately refetch all related queries
        await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
        await queryClient.refetchQueries({ queryKey: ["sculpture", sculptureId] });
      }
      
      // Success notification
      toast({
        title: "Success",
        description: "Weight updated successfully",
      });
      
      // Ensure we exit edit mode after successful save
      setIsEditingWeight(false);
    } catch (err) {
      console.error('Error updating weight:', err);
      toast({
        title: "Error",
        description: "Failed to update weight",
        variant: "destructive",
      });
      // Don't close form on error
    }
  };

  const handleLbsChange = (lbsValue: string) => {
    setWeight(prev => ({
      lbs: lbsValue,
      kg: lbsValue ? calculateKg(parseFloat(lbsValue)).toFixed(2) : ""
    }));
  };

  const handleKgChange = (kgValue: string) => {
    setWeight(prev => ({
      kg: kgValue,
      lbs: kgValue ? (parseFloat(kgValue) * 2.20462).toFixed(2) : ""
    }));
  };

  const handleCancel = () => {
    setWeight({
      kg: weightKg?.toString() || "",
      lbs: weightLbs?.toString() || ""
    });
    setIsEditingWeight(false);
  };

  return {
    isEditingWeight,
    weight,
    formatWeightString,
    formatMetricString,
    handleWeightUpdate,
    handleLbsChange,
    handleKgChange,
    handleCancel,
    setIsEditingWeight,
  };
}
