
import { LinkIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";
import { Button } from "@/components/ui/button";
import { useMaterialFinishData } from "./detail/useMaterialFinishData";
import { DimensionDisplay } from "./DimensionDisplay";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ProductLineButton } from "@/components/sculpture/detail/ProductLineButton";
import { Badge } from "@/components/ui/badge";

interface SculptureInfoProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  showAIContent?: boolean;
}

export function SculptureInfo({ sculpture, tags = [], showAIContent }: SculptureInfoProps) {
  const queryClient = useQueryClient();
  const sculptureName = sculpture.ai_generated_name || "Untitled Sculpture";
  const { materials } = useMaterialFinishData(sculpture.material_id);

  const { data: productLines } = useQuery({
    queryKey: ["product_lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_lines")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 30000,
    gcTime: 300000,
  });

  const { data: currentProductLine } = useQuery({
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
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getMaterialName = () => {
    if (!sculpture.material_id || !materials) return "Not specified";
    const material = materials.find(m => m.id === sculpture.material_id);
    return material ? material.name : "Not specified";
  };

  const handleStatusChange = async (newStatus: Sculpture['status']) => {
    try {
      const { error } = await supabase
        .from('sculptures')
        .update({ status: newStatus })
        .eq('id', sculpture.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      toast.success("Status updated successfully");
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    }
  };

  const handleProductLineChange = async (productLineId: string | null) => {
    try {
      const { error } = await supabase
        .from('sculptures')
        .update({ product_line_id: productLineId })
        .eq('id', sculpture.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["sculpture", sculpture.id] });
      await queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      await queryClient.invalidateQueries({ queryKey: ["product_line", productLineId] });
      
      toast.success("Product line updated successfully");
    } catch (error) {
      console.error('Error updating product line:', error);
      toast.error("Failed to update product line");
    }
  };

  const getProductLineDisplay = () => {
    if (!currentProductLine) return "??";
    return currentProductLine.product_line_code || currentProductLine.name;
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold line-clamp-1">
          {sculptureName}
        </h3>
        <div className="flex items-center gap-2">
          <ProductLineButton 
            sculptureId={sculpture.id}
            productLineId={sculpture.product_line_id}
            productLines={productLines}
            currentProductLine={currentProductLine}
            variant="small"
          />
          <Badge
            variant={
              sculpture.status === "approved" 
                ? "default" 
                : sculpture.status === "pending" 
                  ? "secondary" 
                  : "outline"
            }
            className="capitalize"
          >
            {sculpture.status}
          </Badge>
        </div>
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
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-1.5">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border text-foreground"
              >
                {tag.name}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      )}
    </div>
  );
}
