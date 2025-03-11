
import { Button } from "@/components/ui/button";
import { PencilIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DimensionsDisplayProps {
  displayValue: string;
  onEditClick: () => void;
  isLoading?: boolean;
  height: number | null;
  width: number | null;
  depth: number | null;
}

export function DimensionsDisplay({ 
  displayValue, 
  onEditClick,
  isLoading = false,
  height,
  width,
  depth
}: DimensionsDisplayProps) {
  const [unit, setUnit] = useState<"inches" | "centimeters">("inches");
  
  const formatDimensionString = (h: number | null, w: number | null, d: number | null, unit: 'inches' | 'centimeters') => {
    if (!h && !w && !d) return "No dimensions set";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return unit === 'centimeters' ? (val * 2.54).toFixed(1) : val;
    };
    
    const h_val = formatValue(h);
    const w_val = formatValue(w);
    const d_val = formatValue(d);
    
    return `HWD ${h_val} × ${w_val} × ${d_val} ${unit === 'inches' ? 'in' : 'cm'}`;
  };

  const handleTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex justify-between items-center border rounded-md px-3 py-2 group relative">
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {unit === "inches" ? 
            `HWD ${displayValue.replace(" in", "")} in` : 
            formatDimensionString(height, width, depth, "centimeters")}
        </span>
        <Tabs
          value={unit}
          onValueChange={(value) => setUnit(value as "inches" | "centimeters")}
          className="h-4 flex items-center"
          onClick={handleTabClick}
        >
          <TabsList className="inline-flex h-auto bg-transparent p-0.5 rounded-full border border-[#333333]">
            <TabsTrigger 
              value="inches" 
              className="h-4 px-2 text-xs rounded-full text-black dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              in
            </TabsTrigger>
            <TabsTrigger 
              value="centimeters" 
              className="h-4 px-2 text-xs rounded-full text-black dark:text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              cm
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
