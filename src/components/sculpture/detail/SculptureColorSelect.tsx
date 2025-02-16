
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Color {
  code: string;
  name: string;
}

interface SculptureColorSelectProps {
  colorCode: string | null;
  onColorChange: (code: string) => void;
  finishType: 'cerakote' | 'automotive' | null;
}

const CERAKOTE_COLORS: Color[] = [
  { code: 'H-146', name: 'Graphite Black' },
  { code: 'H-227', name: 'Tactical Grey' },
  { code: 'H-151', name: 'Satin Aluminum' },
  { code: 'H-237', name: 'Tungsten' },
  { code: 'H-190', name: 'Armor Black' },
];

const RAL_COLORS: Color[] = [
  { code: 'RAL9005', name: 'Jet Black' },
  { code: 'RAL9006', name: 'White Aluminium' },
  { code: 'RAL9007', name: 'Grey Aluminium' },
  { code: 'RAL7016', name: 'Anthracite Grey' },
  { code: 'RAL9016', name: 'Traffic White' },
];

export function SculptureColorSelect({
  colorCode,
  onColorChange,
  finishType,
}: SculptureColorSelectProps) {
  if (!finishType) return null;

  const colors = finishType === 'cerakote' ? CERAKOTE_COLORS : RAL_COLORS;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Color</label>
      <Select value={colorCode || ''} onValueChange={onColorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select color" />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[200px]">
            {colors.map((color) => (
              <SelectItem key={color.code} value={color.code}>
                {color.name} ({color.code})
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
