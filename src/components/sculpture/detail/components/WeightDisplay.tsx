
import { Button } from "@/components/ui/button";
import { PencilIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WeightDisplayProps {
  displayValue: string;
  metricValue: string;
  onEditClick: () => void;
  isLoading?: boolean;
  weightKg: number | null;
  weightLbs: number | null;
}

export function WeightDisplay({ 
  displayValue, 
  metricValue, 
  onEditClick,
  isLoading = false,
  weightKg,
  weightLbs
}: WeightDisplayProps) {
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  
  const formatWeightString = (kg: number | null, lbs: number | null, unit: 'lbs' | 'kg') => {
    if (!kg && !lbs) return "";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return val.toFixed(2);
    };
    
    return unit === 'lbs' ? formatValue(lbs) : formatValue(kg);
  };

  const handleTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex justify-between items-center border rounded-md px-3 py-2 group relative">
      <div className="flex items-center gap-2">
        <span className="text-sm">
          <span className="text-muted-foreground mr-1">Weight:</span>
          {formatWeightString(weightKg, weightLbs, unit)}
        </span>
        <Tabs
          value={unit}
          onValueChange={(value) => setUnit(value as "lbs" | "kg")}
          className="h-4 flex items-center"
          onClick={handleTabClick}
        >
          <TabsList className="inline-flex h-auto bg-transparent p-0.5 rounded-full border border-[#333333]">
            <TabsTrigger 
              value="lbs" 
              className="h-4 px-2 text-xs rounded-full text-black dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              lbs
            </TabsTrigger>
            <TabsTrigger 
              value="kg" 
              className="h-4 px-2 text-xs rounded-full text-black dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              kg
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        disabled={isLoading}
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PencilIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
