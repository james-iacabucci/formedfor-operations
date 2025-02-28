
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface DimensionDisplayProps {
  height: number | null;
  width: number | null;
  depth: number | null;
}

export function DimensionDisplay({ height, width, depth }: DimensionDisplayProps) {
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
    
    const unitLabel = unit === 'centimeters' ? '(cm)' : '(in)';
    
    return `HWD: ${h_val} × ${w_val} × ${d_val} ${unitLabel}`;
  };

  const handleTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleTabTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex items-center gap-2" onClick={handleTabClick}>
      <span>
        {formatDimensionString(height, width, depth, unit)}
      </span>
      <Tabs
        value={unit}
        onValueChange={(value) => setUnit(value as "inches" | "centimeters")}
        className="h-5"
      >
        <TabsList className="h-5 p-0.5">
          <TabsTrigger 
            value="inches" 
            className="h-4 px-2 text-xs"
            onClick={handleTabTriggerClick}
          >
            in
          </TabsTrigger>
          <TabsTrigger 
            value="centimeters" 
            className="h-4 px-2 text-xs"
            onClick={handleTabTriggerClick}
          >
            cm
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
