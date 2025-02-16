
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ValueListType {
  value: 'finish' | 'material' | 'fabricator' | 'texture';
  label: string;
  showCode: boolean;
}

interface ValueListTypeSelectorProps {
  types: ValueListType[];
  selectedType: ValueListType['value'];
  onTypeChange: (type: ValueListType['value']) => void;
  onAddClick: () => void;
  getCountForType: (type: ValueListType['value']) => number;
}

export function ValueListTypeSelector({
  types,
  selectedType,
  onTypeChange,
  onAddClick,
  getCountForType,
}: ValueListTypeSelectorProps) {
  const currentTypeConfig = types.find(t => t.value === selectedType)!;

  return (
    <div className="flex items-center justify-between">
      <Select
        value={selectedType}
        onValueChange={onTypeChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select list type" />
        </SelectTrigger>
        <SelectContent>
          {types.map(type => (
            <SelectItem key={type.value} value={type.value}>
              {type.label} ({getCountForType(type.value)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onAddClick} size="sm" className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Add {currentTypeConfig.label.slice(0, -1)}
      </Button>
    </div>
  );
}
