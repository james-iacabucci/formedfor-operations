
import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeightFilterSectionProps {
  heightOperator: 'eq' | 'gt' | 'lt' | null;
  heightValue: number | null;
  heightUnit: 'in' | 'cm';
  onHeightOperatorChange: (value: 'eq' | 'gt' | 'lt' | null) => void;
  onHeightValueChange: (value: number | null) => void;
  onHeightUnitChange: (value: 'in' | 'cm') => void;
}

export function HeightFilterSection({
  heightOperator,
  heightValue,
  heightUnit,
  onHeightOperatorChange,
  onHeightValueChange,
  onHeightUnitChange
}: HeightFilterSectionProps) {
  const heightValueInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <Label>Height</Label>
      <div className="flex gap-2 items-start">
        <Select
          value={heightOperator || 'none'}
          onValueChange={(value) => {
            onHeightOperatorChange(value === 'none' ? null : value as 'eq' | 'gt' | 'lt');
            if (value !== 'none' && heightValueInputRef.current) {
              setTimeout(() => {
                heightValueInputRef.current?.focus();
              }, 0);
            }
          }}
        >
          <SelectTrigger className="w-[140px] focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Any</SelectItem>
            <SelectItem value="eq">Equal to</SelectItem>
            <SelectItem value="gt">Greater than</SelectItem>
            <SelectItem value="lt">Less than</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 items-center flex-1">
          <input
            ref={heightValueInputRef}
            type="number"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Value"
            value={heightValue || ''}
            onChange={(e) => 
              onHeightValueChange(e.target.value === '' ? null : Number(e.target.value))
            }
            disabled={!heightOperator}
          />
          
          <Tabs
            value={heightUnit}
            onValueChange={onHeightUnitChange}
            className="w-[120px]"
          >
            <TabsList className="w-full h-9">
              <TabsTrigger value="in" className="flex-1 text-xs px-2">IN</TabsTrigger>
              <TabsTrigger value="cm" className="flex-1 text-xs px-2">CM</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
