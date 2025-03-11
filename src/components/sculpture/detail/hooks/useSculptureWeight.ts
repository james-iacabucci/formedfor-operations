
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
    const prefix = isBase ? 'base_' : '';
    const updatedWeight = {
      [`${prefix}weight_kg`]: weight.kg ? parseFloat(weight.kg) : null,
      [`${prefix}weight_lbs`]: weight.lbs ? parseFloat(weight.lbs) : null,
    };

    if ((isQuoteForm || isVariantForm) && onWeightChange) {
      // In form mode, update the parent form state and immediately update the UI
      if (weight.kg) onWeightChange(`${prefix}weightKg`, parseFloat(weight.kg));
      if (weight.lbs) onWeightChange(`${prefix}weightLbs`, parseFloat(weight.lbs));
      
      // For variant form, still save to the database
      if (isVariantForm && variantId) {
        try {
          const { error } = await supabase
            .from('sculpture_variants')
            .update(updatedWeight)
            .eq('id', variantId);
            
          if (error) throw error;
          
          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
          
          toast({
            title: "Success",
            description: "Weight updated successfully",
          });
          
          // Make sure we set editing mode to false
          setIsEditingWeight(false);
        } catch (err) {
          console.error('Error updating variant weight:', err);
          toast({
            title: "Error",
            description: "Failed to update weight in database",
            variant: "destructive",
          });
          return; // Don't close the form on error
        }
      } else {
        // Close the form for non-database updates
        setIsEditingWeight(false);
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
          .update(updatedWeight)
          .eq('id', variantId);
        error = variantError;
        
        // Invalidate variant queries
        await queryClient.invalidateQueries({ queryKey: ["sculpture-variants", sculptureId] });
      } else {
        // Update the sculptures table
        const { error: sculptureError } = await supabase
          .from('sculptures')
          .update(updatedWeight)
          .eq('id', sculptureId);
        error = sculptureError;
      }

      if (error) {
        console.error('Error updating weight:', error);
        toast({
          title: "Error",
          description: "Failed to update weight: " + error.message,
          variant: "destructive",
        });
        return; // Don't close the form on error
      }

      // Invalidate sculpture query to refresh data
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      // Force an immediate refetch to update the UI
      await queryClient.refetchQueries({ queryKey: ["sculpture", sculptureId] });
      
      toast({
        title: "Success",
        description: "Weight updated successfully",
      });
      
      // Make sure to close the form after successful update
      setIsEditingWeight(false);
    } catch (err) {
      console.error('Exception updating weight:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating weight",
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
