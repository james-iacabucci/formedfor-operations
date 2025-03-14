
import { useState, useCallback } from "react";
import { FabricationQuote } from "@/types/fabrication-quote";
import { NewQuote } from "@/types/fabrication-quote-form";

export function useQuoteEditing() {
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [initialQuote, setInitialQuote] = useState<NewQuote | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleStartEdit = useCallback((quote: FabricationQuote) => {
    setEditingQuoteId(quote.id);
    setInitialQuote({
      sculpture_id: quote.sculpture_id,
      fabricator_id: quote.fabricator_id,
      fabrication_cost: quote.fabrication_cost,
      shipping_cost: quote.shipping_cost,
      customs_cost: quote.customs_cost,
      other_cost: quote.other_cost,
      markup: quote.markup,
      notes: quote.notes,
      quote_date: quote.quote_date,
      status: quote.status, // Make sure status is included here
      material_id: quote.material_id,
      method_id: quote.method_id,
      height_in: quote.height_in,
      width_in: quote.width_in,
      depth_in: quote.depth_in,
      weight_kg: quote.weight_kg,
      weight_lbs: quote.weight_lbs,
      base_material_id: quote.base_material_id,
      base_method_id: quote.base_method_id,
      base_height_in: quote.base_height_in,
      base_width_in: quote.base_width_in,
      base_depth_in: quote.base_depth_in,
      base_weight_kg: quote.base_weight_kg,
      base_weight_lbs: quote.base_weight_lbs,
      variant_id: quote.variant_id
    });
    setIsSheetOpen(true);
  }, []);

  const handleAddQuote = useCallback((sculptureId: string, variant: any) => {
    if (!variant) {
      console.error("Cannot add quote: Selected variant not found");
      return;
    }
    
    console.log("Adding new quote for variant:", variant.id);
    setEditingQuoteId(null);
    setInitialQuote({
      sculpture_id: sculptureId,
      fabricator_id: undefined,
      fabrication_cost: null,
      shipping_cost: null,
      customs_cost: null,
      other_cost: null,
      markup: 4,
      notes: "",
      quote_date: new Date().toISOString(),
      status: "requested", // Make sure we set a default status for new quotes
      material_id: variant.materialId,
      method_id: variant.methodId,
      height_in: variant.heightIn,
      width_in: variant.widthIn,
      depth_in: variant.depthIn,
      weight_kg: variant.weightKg,
      weight_lbs: variant.weightLbs,
      base_material_id: variant.baseMaterialId,
      base_method_id: variant.baseMethodId,
      base_height_in: variant.baseHeightIn,
      base_width_in: variant.baseWidthIn,
      base_depth_in: variant.baseDepthIn,
      base_weight_kg: variant.baseWeightKg,
      base_weight_lbs: variant.baseWeightLbs,
      variant_id: variant.id
    });
    setIsSheetOpen(true);
  }, []);

  return {
    editingQuoteId,
    initialQuote,
    isSheetOpen,
    setIsSheetOpen,
    handleStartEdit,
    handleAddQuote
  };
}
