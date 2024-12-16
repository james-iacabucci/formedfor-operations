import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

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
            className={sculpture.image_url ? "cursor-pointer group" : ""}
            onClick={() => {
              if (sculpture.image_url) {
                setSelectedSculpture(sculpture);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                {sculpture.image_url ? (
                  <img
                    src={sculpture.image_url}
                    alt={sculpture.prompt}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
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
    </>
  );
}
