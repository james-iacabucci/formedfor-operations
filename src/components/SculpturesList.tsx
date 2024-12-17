import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureCard } from "./sculpture/SculptureCard";
import { Sculpture } from "@/types/sculpture";
import { useState } from "react";
import { DeleteSculptureDialog } from "./sculpture/DeleteSculptureDialog";
import { ManageTagsDialog } from "./tags/ManageTagsDialog";
import { useToast } from "@/hooks/use-toast";

interface SculpturesListProps {
  selectedTags: string[];
}

export function SculpturesList({ selectedTags }: SculpturesListProps) {
  const [sculptureToDelete, setSculptureToDelete] = useState<Sculpture | null>(null);
  const [sculptureToManageTags, setSculptureToManageTags] = useState<Sculpture | null>(null);
  const { toast } = useToast();

  const { data: sculptures, isLoading } = useQuery({
    queryKey: ["sculptures", selectedTags],
    queryFn: async () => {
      console.log("Fetching sculptures with selected tags:", selectedTags);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      let query = supabase.from("sculptures").select("*").eq("user_id", user.user.id);

      if (selectedTags.length > 0) {
        // Only apply the tag filtering if tags are selected
        query = supabase
          .from("sculptures")
          .select(`
            *,
            sculpture_tags!inner (
              tag_id
            )
          `)
          .eq("user_id", user.user.id)
          .in('sculpture_tags.tag_id', selectedTags);
      }

      const { data, error } = await query;
      if (error) throw error;

      console.log("Fetched sculptures:", data);
      return data as Sculpture[];
    },
  });

  // Query to fetch sculpture-tag relationships
  const { data: sculptureTagRelations } = useQuery({
    queryKey: ["sculpture_tags"],
    queryFn: async () => {
      console.log("Fetching sculpture tags...");
      const { data, error } = await supabase
        .from("sculpture_tags")
        .select("sculpture_id, tag_id");

      if (error) throw error;
      console.log("Fetched sculpture tags:", data);
      return data;
    },
  });

  // Query to fetch all tags
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      console.log("Fetching tags...");
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.user.id);

      if (error) throw error;
      console.log("Fetched tags:", data);
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sculptures?.length) {
    return <div>No sculptures found</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sculptures.map((sculpture) => {
          // Filter tags for this specific sculpture
          const sculptureSpecificTags = tags?.filter(tag => 
            sculptureTagRelations?.some(relation => 
              relation.sculpture_id === sculpture.id && relation.tag_id === tag.id
            )
          ) || [];

          return (
            <SculptureCard 
              key={sculpture.id} 
              sculpture={sculpture}
              tags={sculptureSpecificTags}
              onDelete={setSculptureToDelete}
              onManageTags={setSculptureToManageTags}
            />
          );
        })}
      </div>

      <DeleteSculptureDialog
        sculpture={sculptureToDelete}
        open={!!sculptureToDelete}
        onOpenChange={(open) => !open && setSculptureToDelete(null)}
      />

      <ManageTagsDialog
        sculpture={sculptureToManageTags}
        open={!!sculptureToManageTags}
        onOpenChange={(open) => !open && setSculptureToManageTags(null)}
      />
    </>
  );
}