
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SculptureVariantDetails } from "@/components/sculpture/detail/SculptureVariant";

export function useVariantMutations(
  sculptureId: string, 
  variants?: SculptureVariantDetails[],
  onSuccess?: () => void
) {
  const { toast } = useToast();

  // Create a new variant (duplicate of current)
  const createVariant = useMutation({
    mutationFn: async (currentVariantId: string) => {
      // Find the current variant
      const currentVariant = variants?.find(v => v.id === currentVariantId);
      if (!currentVariant) {
        console.error("Current variant not found:", currentVariantId);
        throw new Error("Current variant not found");
      }

      // Get the max order index
      const maxOrderIndex = Math.max(...(variants?.map(v => v.orderIndex) || [0]));

      try {
        console.log("Creating new variant based on:", currentVariant);
        
        // Create a new variant based on the current one
        const { data, error } = await supabase
          .from('sculpture_variants')
          .insert({
            sculpture_id: sculptureId,
            material_id: currentVariant.materialId,
            method_id: currentVariant.methodId,
            height_in: currentVariant.heightIn,
            width_in: currentVariant.widthIn,
            depth_in: currentVariant.depthIn,
            weight_kg: currentVariant.weightKg,
            weight_lbs: currentVariant.weightLbs,
            base_material_id: currentVariant.baseMaterialId,
            base_method_id: currentVariant.baseMethodId,
            base_height_in: currentVariant.baseHeightIn,
            base_width_in: currentVariant.baseWidthIn,
            base_depth_in: currentVariant.baseDepthIn,
            base_weight_kg: currentVariant.baseWeightKg,
            base_weight_lbs: currentVariant.baseWeightLbs,
            order_index: maxOrderIndex + 1,
            is_archived: false
          })
          .select('id')
          .single();

        if (error) {
          console.error("Error in createVariant insert:", error);
          throw error;
        }

        console.log("New variant created with ID:", data?.id);
        return data?.id;
      } catch (error) {
        console.error("Error in createVariant:", error);
        throw error;
      }
    },
    onSuccess: async (newVariantId) => {
      console.log("Variant created successfully, updating queries and quotes");
      
      if (onSuccess) {
        await onSuccess();
      }
      
      toast({
        title: "Success",
        description: "New variant created successfully",
      });
      
      return newVariantId;
    },
    onError: (error) => {
      console.error("Error creating variant:", error);
      toast({
        title: "Error",
        description: "Failed to create new variant",
        variant: "destructive",
      });
    }
  });

  // Archive a variant
  const archiveVariant = useMutation({
    mutationFn: async (variantId: string) => {
      try {
        console.log("Archiving variant:", variantId);
        const { error } = await supabase
          .from('sculpture_variants')
          .update({ is_archived: true })
          .eq('id', variantId);

        if (error) {
          console.error("Error in archiveVariant update:", error);
          throw error;
        }

        return variantId;
      } catch (error) {
        console.error("Error in archiveVariant:", error);
        throw error;
      }
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
      
      toast({
        title: "Success",
        description: "Variant archived successfully",
      });
    },
    onError: (error) => {
      console.error("Error archiving variant:", error);
      toast({
        title: "Error",
        description: "Failed to archive variant",
        variant: "destructive",
      });
    }
  });

  // Delete a variant completely
  const deleteVariant = useMutation({
    mutationFn: async (variantId: string) => {
      try {
        console.log("Deleting variant and associated quotes:", variantId);
        // First, delete any quotes associated with this variant
        const { error: quotesError } = await supabase
          .from("fabrication_quotes")
          .delete()
          .eq("variant_id", variantId);

        if (quotesError) {
          console.error("Error deleting associated quotes:", quotesError);
          // Continue anyway to try to delete the variant
        }

        // Then delete the variant
        const { error } = await supabase
          .from('sculpture_variants')
          .delete()
          .eq('id', variantId);

        if (error) {
          console.error("Error in deleteVariant:", error);
          throw error;
        }

        return variantId;
      } catch (error) {
        console.error("Error in deleteVariant:", error);
        throw error;
      }
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
      
      toast({
        title: "Success",
        description: "Variant deleted permanently",
      });
    },
    onError: (error) => {
      console.error("Error deleting variant:", error);
      toast({
        title: "Error",
        description: "Failed to delete variant",
        variant: "destructive",
      });
    }
  });

  return {
    createVariant: createVariant.mutateAsync,
    archiveVariant: archiveVariant.mutateAsync,
    deleteVariant: deleteVariant.mutateAsync,
    isCreatingVariant: createVariant.isPending,
    isArchivingVariant: archiveVariant.isPending,
    isDeletingVariant: deleteVariant.isPending
  };
}
