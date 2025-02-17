
import { LinkIcon, TagIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";
import { Badge } from "@/components/ui/badge";
import { useMaterialFinishData } from "./detail/useMaterialFinishData";
import { DimensionDisplay } from "./DimensionDisplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SculptureInfoProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  showAIContent?: boolean;
}

export function SculptureInfo({ sculpture, tags = [], showAIContent }: SculptureInfoProps) {
  const sculptureName = sculpture.ai_generated_name || "Untitled Sculpture";
  const { materials } = useMaterialFinishData(sculpture.material_id);

  const { data: productLine } = useQuery({
    queryKey: ["product_line", sculpture.product_line_id],
    queryFn: async () => {
      if (!sculpture.product_line_id) return null;
      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .eq("id", sculpture.product_line_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sculpture.product_line_id,
    retry: false,
    staleTime: 30000,
    gcTime: 300000,
  });

  const getDisplayStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      idea: "Idea",
      pending: "Pending",
      approved: "Approved",
      archived: "Archived"
    };
    return statusMap[status] || status;
  };

  const getMaterialName = () => {
    if (!sculpture.material_id || !materials) return "Not specified";
    const material = materials.find(m => m.id === sculpture.material_id);
    return material ? material.name : "Not specified";
  };

  // Format the display text for product line and status
  const getProductLineStatusDisplay = () => {
    const status = getDisplayStatus(sculpture.status);
    if (!productLine) {
      return `Unassigned (${status})`;
    }
    const code = productLine.product_line_code || productLine.name;
    return `${code} (${status})`;
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold line-clamp-1">
          {sculptureName}
        </h3>
        <span className="text-sm text-muted-foreground">
          {getProductLineStatusDisplay()}
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
        <DimensionDisplay
          height={sculpture.height_in}
          width={sculpture.width_in}
          depth={sculpture.depth_in}
        />
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
