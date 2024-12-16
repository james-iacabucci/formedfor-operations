import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type Sculpture = {
  id: string;
  prompt: string;
  image_url: string | null;
  created_at: string;
};

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
          <Card
            key={sculpture.id}
            className={`group relative ${
              sculpture.image_url ? "cursor-pointer" : ""
            }`}
            onClick={(e) => {
              // Only open preview if clicking on the card itself, not the delete button
              if (
                sculpture.image_url &&
                !(e.target as HTMLElement).closest("button")
              ) {
                setSelectedSculpture(sculpture);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                {sculpture.image_url ? (
                  <>
                    <img
                      src={sculpture.image_url}
                      alt={sculpture.prompt}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(sculpture);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      aria-label="Delete sculpture"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span>Generating...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(sculpture.created_at), "MMM d, yyyy")}
                </p>
                <p className="mt-1 font-medium line-clamp-2">{sculpture.prompt}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={selectedSculpture !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSculpture(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedSculpture?.prompt}
            </DialogTitle>
          </DialogHeader>
          {selectedSculpture?.image_url && (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <img
                src={selectedSculpture.image_url}
                alt={selectedSculpture.prompt}
                className="object-cover"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={sculptureToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSculptureToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              sculpture.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}