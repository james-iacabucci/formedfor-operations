import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenIcon, CheckIcon, XIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SculptureWeightProps {
  sculptureId: string;
  weightKg: number | null;
  weightLbs: number | null;
}

export function SculptureWeight({ sculptureId, weightKg, weightLbs }: SculptureWeightProps) {
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
    
    return `${formatValue(lbs)} lbs`;
  };

  const formatMetricString = (kg: number | null) => {
    if (!kg) return "";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val.toFixed(2);
    };
    
    return `| ${formatValue(kg)} kg`;
  };

  const handleWeightUpdate = async () => {
    const updatedWeight = {
      weight_kg: weight.kg ? parseFloat(weight.kg) : null,
      weight_lbs: weight.lbs ? parseFloat(weight.lbs) : null,
    };

    const { error } = await supabase
      .from('sculptures')
      .update(updatedWeight)
      .eq('id', sculptureId);

    if (error) {
      console.error('Error updating weight:', error);
      toast({
        title: "Error",
        description: "Failed to update weight",
        variant: "destructive",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["sculpture", sculptureId] });
    
    toast({
      title: "Success",
      description: "Weight updated successfully",
    });
    
    setIsEditingWeight(false);
  };

  return (
    <div>
      {isEditingWeight ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
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
            <Input
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
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleWeightUpdate}
              size="sm"
              variant="ghost"
            >
              <CheckIcon className="h-4 w-4" />
            </Button>
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
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border rounded-md py-0 px-3">
          <div className="flex gap-1 items-center flex-1">
            <span className="text-muted-foreground text-sm">Weight:</span>
            <div className="flex-1 flex gap-1">
              <Input
                readOnly
                value={formatWeightString(weightKg, weightLbs)}
                placeholder="Enter weight"
                className="border-0 focus-visible:ring-0 px-0"
                onClick={() => setIsEditingWeight(true)}
              />
              <span className="text-muted-foreground">
                {formatMetricString(weightKg)}
              </span>
            </div>
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
