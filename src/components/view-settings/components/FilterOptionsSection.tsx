
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterOption {
  id: string;
  name: string;
}

interface FilterOptionsSectionProps {
  title: string;
  options: FilterOption[];
  selectedIds: string[];
  onSelectionChange: (id: string, checked: boolean) => void;
}

export function FilterOptionsSection({
  title,
  options,
  selectedIds,
  onSelectionChange
}: FilterOptionsSectionProps) {
  return (
    <div className="space-y-4">
      <Label>{title}</Label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={`${title.toLowerCase()}-${option.id}`}
              checked={selectedIds.includes(option.id)}
              onCheckedChange={(checked) => 
                onSelectionChange(option.id, checked as boolean)
              }
            />
            <label
              htmlFor={`${title.toLowerCase()}-${option.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
