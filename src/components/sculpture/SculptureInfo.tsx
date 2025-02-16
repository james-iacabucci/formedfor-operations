
import { LinkIcon, TagIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";
import { Badge } from "@/components/ui/badge";
import { useMaterialFinishData } from "./detail/useMaterialFinishData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface SculptureInfoProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  showAIContent?: boolean;
}

export function SculptureInfo({ sculpture, tags = [], showAIContent }: SculptureInfoProps) {
  const [unit, setUnit] = useState<"inches" | "centimeters">("inches");
  const sculptureName = sculpture.ai_generated_name || "Untitled Sculpture";
  const { materials } = useMaterialFinishData(sculpture.material_id);

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case "ideas":
        return "Idea";
      case "pending_additions":
        return "Pending Addition";
      case "approved":
        return "Approved";
      default:
        return status;
    }
  };

  const formatDimensionString = (h: number | null, w: number | null, d: number | null, unit: 'inches' | 'centimeters') => {
    if (!h && !w && !d) return "No dimensions set";
    
    const formatValue = (val: number | null) => {
      if (val === null) return '-';
      return unit === 'centimeters' ? (val * 2.54).toFixed(1) : val;
    };
    
    const h_val = formatValue(h);
    const w_val = formatValue(w);
    const d_val = formatValue(d);
    
    return `${h_val}h - ${w_val}w - ${d_val}d`;
  };

  const getMaterialName = () => {
    if (!sculpture.material_id || !materials) return "Not specified";
    const material = materials.find(m => m.id === sculpture.material_id);
    return material ? material.name : "Not specified";
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold line-clamp-1">
          {sculptureName}
        </h3>
        <span className="text-sm text-muted-foreground">
          {getDisplayStatus(sculpture.status)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {sculpture.original_sculpture_id && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <LinkIcon className="w-4 h-4" />
            <span>Variation ({sculpture.creativity_level})</span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div>
          {getMaterialName()}
        </div>
        <div className="flex flex-col gap-2">
          <span>
            {formatDimensionString(
              sculpture.height_in,
              sculpture.width_in,
              sculpture.depth_in,
              unit
            )}
          </span>
          <Tabs
            value={unit}
            onValueChange={(value) => setUnit(value as "inches" | "centimeters")}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inches">inches</TabsTrigger>
              <TabsTrigger value="centimeters">centimeters</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 text-xs px-2 py-0.5"
            >
              <TagIcon className="w-3 h-3" />
              <span>{tag.name}</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
