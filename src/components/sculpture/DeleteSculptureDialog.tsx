import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sculpture } from "@/types/sculpture";
import { ArchiveDeleteDialog } from "@/components/common/ArchiveDeleteDialog";

interface DeleteSculptureDialogProps {
  sculpture: Sculpture | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSculptureDialog({
  sculpture,
  open,
  onOpenChange,
}: DeleteSculptureDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  console.log("[DeleteSculptureDialog] Current sculpture:", sculpture);
  console.log("[DeleteSculptureDialog] Dialog open:", open);

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!sculpture?.id) {
        console.error("[DeleteSculptureDialog] No sculpture ID provided for archiving:", sculpture);
        throw new Error("No sculpture ID provided");
      }

      console.log("[DeleteSculptureDialog] Archiving sculpture:", sculpture.id);

      const { error } = await supabase
        .from("sculptures")
        .update({ status: "archived" })
        .eq("id", sculpture.id);

      if (error) {
        console.error("[DeleteSculptureDialog] Error archiving sculpture:", error);
        throw error;
      }

      console.log("[DeleteSculptureDialog] Successfully archived sculpture");
    },
    onSuccess: () => {
      console.log("[DeleteSculptureDialog] Archive mutation successful");
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Sculpture archived successfully.",
      });
    },
    onError: (error) => {
      console.error("[DeleteSculptureDialog] Archive mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to archive sculpture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!sculpture?.id) {
        console.error("[DeleteSculptureDialog] No sculpture ID provided for deletion:", sculpture);
        throw new Error("No sculpture ID provided");
      }
      
      console.log("[DeleteSculptureDialog] Starting deletion for sculpture:", sculpture.id);

      // Helper function to recursively get all variations
      const getAllVariationIds = async (sculptureId: string): Promise<string[]> => {
        const { data: directVariations, error: variationsError } = await supabase
          .from("sculptures")
          .select("id")
          .eq("original_sculpture_id", sculptureId);

        if (variationsError) {
          console.error("[DeleteSculptureDialog] Error fetching variations:", variationsError);
          throw variationsError;
        }

        if (!directVariations || directVariations.length === 0) {
          return [];
        }

        const directVariationIds = directVariations.map(v => v.id);
        const nestedVariationIds = await Promise.all(
          directVariationIds.map(id => getAllVariationIds(id))
        );

        return [...directVariationIds, ...nestedVariationIds.flat()];
      };

      // Get all variations recursively
      const allVariationIds = await getAllVariationIds(sculpture.id);
      console.log("[DeleteSculptureDialog] Found all variations:", allVariationIds);

      // If there are any variations, delete their tags and then the variations themselves
      if (allVariationIds.length > 0) {
        // Delete tags for all variations
        const { error: variationTagsError } = await supabase
          .from("sculpture_tags")
          .delete()
          .in("sculpture_id", allVariationIds);

        if (variationTagsError) {
          console.error("[DeleteSculptureDialog] Error deleting variation tags:", variationTagsError);
          throw variationTagsError;
        }

        // Delete variations in reverse order (most nested first)
        for (const variationId of allVariationIds.reverse()) {
          const { error: variationDeleteError } = await supabase
            .from("sculptures")
            .delete()
            .eq("id", variationId);

          if (variationDeleteError) {
            console.error(`[DeleteSculptureDialog] Error deleting variation ${variationId}:`, variationDeleteError);
            throw variationDeleteError;
          }
        }

        console.log("[DeleteSculptureDialog] Successfully deleted all variations");
      }

      // Delete tags for the main sculpture
      const { error: tagError } = await supabase
        .from("sculpture_tags")
        .delete()
        .eq("sculpture_id", sculpture.id);

      if (tagError) {
        console.error("[DeleteSculptureDialog] Error deleting sculpture tags:", tagError);
        throw tagError;
      }

      console.log("[DeleteSculptureDialog] Successfully deleted sculpture tags");

      // Finally delete the main sculpture
      const { error } = await supabase
        .from("sculptures")
        .delete()
        .eq("id", sculpture.id);

      if (error) {
        console.error("[DeleteSculptureDialog] Error deleting sculpture:", error);
        throw error;
      }

      console.log("[DeleteSculptureDialog] Successfully deleted sculpture");
    },
    onSuccess: () => {
      console.log("[DeleteSculptureDialog] Mutation successful");
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Sculpture and all its variations deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("[DeleteSculptureDialog] Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to delete sculpture. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <ArchiveDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Manage Sculpture"
      description="You can either archive this sculpture or permanently delete it and all its variations. Archived sculptures can be restored later."
      onArchive={() => archiveMutation.mutate()}
      onDelete={() => deleteMutation.mutate()}
      isLoading={archiveMutation.isPending || deleteMutation.isPending}
    />
  );
}
