
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
import { FabricationQuote } from "@/types/fabrication-quote";

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
      return data as FabricationQuote;
    },
    staleTime: 30000,
    gcTime: 300000,
  });
  
  const { materials } = useMaterialFinishData(selectedQuote?.material_id);

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

  const getMaterialName = () => {
    if (!selectedQuote?.material_id || !materials) return "Not specified";
    const material = materials.find(m => m.id === selectedQuote.material_id);
    return material ? material.name : "Not specified";
  };

  // Format the price display based on the selected quote
  const getPriceDisplay = () => {
    if (!selectedQuote) return "Inquire";
    
    const tradePrice = calculateTradePrice(selectedQuote);
    const retailPrice = calculateRetailPrice(tradePrice);
    
    return `Trade $${formatNumber(tradePrice)} | Retail $${formatNumber(retailPrice)}`;
  };

  return (
    <div className="space-y-3">
      {/* Title row with product line and status */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold line-clamp-1">
            {sculpture.name || "Untitled Sculpture"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <ProductLineButton 
            sculptureId={sculpture.id}
            productLineId={sculpture.product_line_id}
            productLines={productLines}
            currentProductLine={currentProductLine}
            variant="small"
            className="h-5 text-xs"
          />
          <SculptureStatus
            sculptureId={sculpture.id}
            status={sculpture.status}
            variant="small"
            className="h-5 text-xs"
          />
        </div>
      </div>

      {/* Create a more evenly spaced layout using a space-y-2 wrapper */}
      <div className="space-y-2 text-sm">
        {/* Pricing row */}
        <div className="text-white">
          {getPriceDisplay()}
        </div>

        {/* Material row */}
        <div>
          {getMaterialName()}
        </div>
        
        {/* Dimensions - use dimensions from selected quote if available */}
        {selectedQuote && (
          <DimensionDisplay
            height={selectedQuote.height_in}
            width={selectedQuote.width_in}
            depth={selectedQuote.depth_in}
          />
        )}
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
