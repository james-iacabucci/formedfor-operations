
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NewQuote } from "@/types/fabrication-quote-form";

export function useQuoteSave() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveQuote = async (
    newQuote: NewQuote, 
    editingQuoteId: string | null, 
    onSuccess: () => Promise<void>,
    submitForApproval: boolean = false
  ) => {
    if (!newQuote.fabricator_id) {
      toast({
        title: "Error",
        description: "Please select a fabricator",
        variant: "destructive",
      });
      return false;
    }

    setIsSaving(true);
    try {
      console.log("Saving quote:", newQuote);
      
      // If submitting for approval, update status
      if (submitForApproval) {
        newQuote.status = "submitted";
      } else if (!newQuote.status) {
        newQuote.status = "requested";
      }
      
      if (editingQuoteId) {
        // Update existing quote
        const { error } = await supabase
          .from("fabrication_quotes")
          .update({
            fabricator_id: newQuote.fabricator_id,
            fabrication_cost: newQuote.fabrication_cost,
            shipping_cost: newQuote.shipping_cost,
            customs_cost: newQuote.customs_cost,
            other_cost: newQuote.other_cost,
            markup: newQuote.markup,
            notes: newQuote.notes,
            quote_date: newQuote.quote_date,
            status: newQuote.status,
            // Include all physical attributes from the variant
            material_id: newQuote.material_id,
            method_id: newQuote.method_id,
            height_in: newQuote.height_in,
            width_in: newQuote.width_in,
            depth_in: newQuote.depth_in,
            weight_kg: newQuote.weight_kg,
            weight_lbs: newQuote.weight_lbs,
            base_material_id: newQuote.base_material_id,
            base_method_id: newQuote.base_method_id,
            base_height_in: newQuote.base_height_in,
            base_width_in: newQuote.base_width_in,
            base_depth_in: newQuote.base_depth_in,
            base_weight_kg: newQuote.base_weight_kg,
            base_weight_lbs: newQuote.base_weight_lbs,
            variant_id: newQuote.variant_id
          })
          .eq("id", editingQuoteId);

        if (error) {
          console.error("Error updating quote:", error);
          throw error;
        }

        toast({
          title: "Success",
          description: submitForApproval ? "Quote submitted for approval" : "Quote updated successfully",
        });
      } else {
        // Add new quote
        const quoteToInsert = {
          ...newQuote,
          sculpture_id: newQuote.sculpture_id,
        };

        console.log("Inserting new quote:", quoteToInsert);
        const { error } = await supabase
          .from("fabrication_quotes")
          .insert(quoteToInsert);

        if (error) {
          console.error("Error inserting quote:", error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Quote added successfully",
        });
      }

      // Refresh quotes and close sheet
      await onSuccess();
      return true;
    } catch (error: any) {
      console.error("Error saving quote:", error);
      toast({
        title: "Error",
        description: "Failed to save quote: " + error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveQuote, isSaving };
}
