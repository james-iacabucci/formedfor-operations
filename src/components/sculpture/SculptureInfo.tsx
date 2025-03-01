
import React from "react";
import { ProductLineButton } from "@/components/sculpture/detail/ProductLineButton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sculpture } from "@/types/sculpture";
import { useMaterialFinishData } from "./detail/useMaterialFinishData";
import { DimensionDisplay } from "./DimensionDisplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureStatus } from "./detail/SculptureStatus";
import { Badge } from "@/components/ui/badge";
import { calculateTradePrice, calculateRetailPrice, formatNumber } from "@/utils/fabrication-quote-calculations";

interface SculptureInfoProps {
  sculpture: Sculpture;
  tags: Array<{ id: string; name: string }>;
  showAIContent?: boolean;
  showTags?: boolean;
}

export function SculptureInfo({ 
  sculpture, 
  tags = [], 
  showAIContent,
  showTags = false
}: SculptureInfoProps) {
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

  // Query for the selected fabrication quote
  const { data: selectedQuote } = useQuery({
    queryKey: ["selected_fabrication_quote", sculpture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fabrication_quotes")
        .select("*")
        .eq("sculpture_id", sculpture.id)
        .eq("is_selected", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 30000,
    gcTime: 300000,
  });

  const getMaterialName = () => {
    if (!sculpture.material_id || !materials) return "Not specified";
    const material = materials.find(m => m.id === sculpture.material_id);
    return material ? material.name : "Not specified";
  };

  // Format the price display
  const getPriceDisplay = () => {
    if (!selectedQuote) return "Inquire";
    
    const tradePrice = calculateTradePrice(selectedQuote);
    const retailPrice = calculateRetailPrice(tradePrice);
    
    return `$${formatNumber(tradePrice)} / $${formatNumber(retailPrice)}`;
  };

  return (
    <div className="space-y-3">
      {/* Title row with product line, status, and price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold line-clamp-1">
            {sculpture.ai_generated_name || "Untitled Sculpture"}
          </h3>
          <ProductLineButton 
            sculptureId={sculpture.id}
            productLineId={sculpture.product_line_id}
            productLines={productLines}
            currentProductLine={currentProductLine}
            variant="small"
          />
          <SculptureStatus
            sculptureId={sculpture.id}
            status={sculpture.status}
            variant="small"
          />
        </div>
        <div className="bg-secondary h-5 px-2 text-[10px] rounded-md text-secondary-foreground">
          {getPriceDisplay()}
        </div>
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

      {/* Only show tags if the showTags prop is true */}
      {showTags && tags.length > 0 && (
        <div className="min-h-[28px]">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-1.5">
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="bg-muted text-white border-0"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
