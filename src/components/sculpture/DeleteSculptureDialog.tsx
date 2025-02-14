
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sculpture } from "@/types/sculpture";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!sculpture?.id) {
        console.error("[DeleteSculptureDialog] No sculpture ID provided for deletion:", sculpture);
        throw new Error("No sculpture ID provided");
      }
      
      console.log("[DeleteSculptureDialog] Starting deletion for sculpture:", sculpture.id);

      // First, fetch any variations of this sculpture
      const { data: variations, error: variationsError } = await supabase
        .from("sculptures")
        .select("id")
        .eq("original_sculpture_id", sculpture.id);

      if (variationsError) {
        console.error("[DeleteSculptureDialog] Error fetching variations:", variationsError);
        throw variationsError;
      }

      console.log("[DeleteSculptureDialog] Found variations:", variations);

      // Delete tags for variations first
      if (variations && variations.length > 0) {
        const variationIds = variations.map(v => v.id);
        const { error: variationTagsError } = await supabase
          .from("sculpture_tags")
          .delete()
          .in("sculpture_id", variationIds);

        if (variationTagsError) {
          console.error("[DeleteSculptureDialog] Error deleting variation tags:", variationTagsError);
          throw variationTagsError;
        }

        // Then delete the variations themselves
        const { error: variationsDeleteError } = await supabase
          .from("sculptures")
          .delete()
          .in("id", variationIds);

        if (variationsDeleteError) {
          console.error("[DeleteSculptureDialog] Error deleting variations:", variationsDeleteError);
          throw variationsDeleteError;
        }

        console.log("[DeleteSculptureDialog] Successfully deleted variations");
      }

      // Delete any sculpture tags for the main sculpture
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
        description: "Sculpture and its variations deleted successfully.",
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

  const handleDelete = () => {
    console.log("[DeleteSculptureDialog] Delete button clicked");
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            sculpture and all its variations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
