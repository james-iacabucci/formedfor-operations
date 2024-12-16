import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Sculpture } from "@/types/sculpture";
import { SculptureCard } from "./sculpture/SculptureCard";
import { SculpturePreviewDialog } from "./sculpture/SculpturePreviewDialog";
import { DeleteSculptureDialog } from "./sculpture/DeleteSculptureDialog";

export function SculpturesList() {
  const [selectedSculpture, setSelectedSculpture] = useState<Sculpture | null>(
    null
  );
  const [sculptureToDelete, setSculptureToDelete] = useState<Sculpture | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data: sculptures, isLoading } = useQuery({
    queryKey: ["sculptures"],
    queryFn: async () => {
      console.log("Fetching sculptures...");
      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sculptures:", error);
        throw error;
      }

      console.log("Fetched sculptures:", data);
      return data as Sculpture[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (sculptureId: string) => {
      const { error } = await supabase
        .from("sculptures")
        .delete()
        .eq("id", sculptureId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      toast({
        title: "Sculpture deleted",
        description: "The sculpture has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error("Error deleting sculpture:", error);
      toast({
        title: "Error",
        description: "Failed to delete the sculpture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (sculpture: Sculpture) => {
    setSculptureToDelete(sculpture);
  };

  const confirmDelete = () => {
    if (sculptureToDelete) {
      deleteMutation.mutate(sculptureToDelete.id);
      setSculptureToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!sculptures?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sculptures created yet. Try creating one above!
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sculptures.map((sculpture) => (
          <SculptureCard
            key={sculpture.id}
            sculpture={sculpture}
            onPreview={setSelectedSculpture}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <SculpturePreviewDialog
        sculpture={selectedSculpture}
        onOpenChange={(open) => {
          if (!open) setSelectedSculpture(null);
        }}
      />

      <DeleteSculptureDialog
        sculpture={sculptureToDelete}
        onOpenChange={(open) => {
          if (!open) setSculptureToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}