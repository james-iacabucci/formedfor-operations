import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Sculpture } from "@/types/sculpture";
import { SculptureCard } from "./sculpture/SculptureCard";
import { SculpturePreviewDialog } from "./sculpture/SculpturePreviewDialog";
import { DeleteSculptureDialog } from "./sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "./tags/ManageTagsDialog";
import { TagsSelect } from "./tags/TagsSelect";

export function SculpturesList() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSculpture, setSelectedSculpture] = useState<Sculpture | null>(null);
  const [sculptureToDelete, setSculptureToDelete] = useState<Sculpture | null>(null);
  const [sculptureToManageTags, setSculptureToManageTags] = useState<Sculpture | null>(null);

  const { data: sculptures, isLoading } = useQuery({
    queryKey: ["sculptures", selectedTags],
    queryFn: async () => {
      console.log("Fetching sculptures for tags:", selectedTags);
      let query = supabase
        .from("sculptures")
        .select(`
          *,
          sculpture_tags!left (
            tag:tags(id, name)
          )
        `);

      if (selectedTags.length > 0) {
        const { data: taggedSculptures } = await supabase
          .from("sculpture_tags")
          .select("sculpture_id")
          .in("tag_id", selectedTags);

        const sculptureIds = taggedSculptures?.map(ts => ts.sculpture_id) || [];
        if (sculptureIds.length === 0) return [];
        query = query.in("id", sculptureIds);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching sculptures:", error);
        throw error;
      }

      console.log("Fetched sculptures:", data);
      return data as (Sculpture & { sculpture_tags: Array<{ tag: { id: string, name: string } }> })[];
    },
  });

  const handleDelete = (sculpture: Sculpture) => {
    setSculptureToDelete(sculpture);
  };

  const confirmDelete = async () => {
    if (sculptureToDelete) {
      try {
        const { error } = await supabase
          .from("sculptures")
          .delete()
          .eq("id", sculptureToDelete.id);

        if (error) throw error;

        toast({
          title: "Sculpture deleted",
          description: "The sculpture has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting sculpture:", error);
        toast({
          title: "Error",
          description: "Failed to delete the sculpture. Please try again.",
          variant: "destructive",
        });
      }
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

  return (
    <>
      <div className="mb-6">
        <TagsSelect
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />
      </div>

      {!sculptures?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          No sculptures found. Try creating one above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sculptures?.map((sculpture) => (
            <SculptureCard
              key={sculpture.id}
              sculpture={sculpture}
              tags={sculpture.sculpture_tags.map(st => st.tag).filter(Boolean)}
              onPreview={setSelectedSculpture}
              onDelete={handleDelete}
              onManageTags={setSculptureToManageTags}
              showAIContent={selectedTags.length > 0}
            />
          ))}
        </div>
      )}

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

      <ManageTagsDialog
        sculpture={sculptureToManageTags}
        onOpenChange={(open) => {
          if (!open) setSculptureToManageTags(null);
        }}
      />
    </>
  );
}