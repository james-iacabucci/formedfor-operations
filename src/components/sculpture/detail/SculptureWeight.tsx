
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenIcon, CheckIcon, XIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface SculptureWeightProps {
  sculptureId: string;
  weightKg: number | null;
  weightLbs: number | null;
  isBase?: boolean;
  isQuoteForm?: boolean;
  isVariantForm?: boolean;
  variantId?: string;
  onWeightChange?: (field: string, value: number | null) => void;
}

export function SculptureWeight({ 
  sculptureId, 
  weightKg, 
  weightLbs, 
  isBase = false,
  isQuoteForm = false,
  isVariantForm = false,
  variantId,
  onWeightChange
}: SculptureWeightProps) {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weight, setWeight] = useState({
    kg: weightKg?.toString() || "",
    lbs: weightLbs?.toString() || ""
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      // In form mode, update the parent form state
      if (weight.kg) onWeightChange(`${prefix}weightKg`, parseFloat(weight.kg));
      if (weight.lbs) onWeightChange(`${prefix}weightLbs`, parseFloat(weight.lbs));
      setIsEditingWeight(false);
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
        return;
      }

      // Invalidate sculpture query to refresh data
      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
      
      toast({
        title: "Success",
        description: "Weight updated successfully",
      });
    } catch (err) {
      console.error('Exception updating weight:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating weight",
        variant: "destructive",
      });
    } finally {
      setIsEditingWeight(false);
    }
  };

  return (
    <div>
      {isEditingWeight ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="weight-lbs-input">Weight (lbs)</Label>
              <Input
                id="weight-lbs-input"
                type="number"
                value={weight.lbs}
                onChange={(e) => {
                  const lbsValue = e.target.value;
                  setWeight(prev => ({
                    lbs: lbsValue,
                    kg: lbsValue ? calculateKg(parseFloat(lbsValue)).toFixed(2) : ""
                  }));
                }}
                placeholder="Weight (lbs)"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight-kg-input">Weight (kg)</Label>
              <Input
                id="weight-kg-input"
                type="number"
                value={weight.kg}
                onChange={(e) => {
                  const kgValue = e.target.value;
                  setWeight(prev => ({
                    kg: kgValue,
                    lbs: kgValue ? (parseFloat(kgValue) * 2.20462).toFixed(2) : ""
                  }));
                }}
                placeholder="Weight (kg)"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setWeight({
                  kg: weightKg?.toString() || "",
                  lbs: weightLbs?.toString() || ""
                });
                setIsEditingWeight(false);
              }}
            >
              <XIcon className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleWeightUpdate}
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
            <span className="text-muted-foreground text-sm">Weight:</span>
            <Input
              readOnly
              value={formatWeightString(weightKg, weightLbs) + " " + formatMetricString(weightKg)}
              placeholder="Enter weight"
              className={`border-0 focus-visible:ring-0 px-0 ${!weightKg && !weightLbs ? 'placeholder:text-white' : ''}`}
              onClick={() => setIsEditingWeight(true)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingWeight(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <PenIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
