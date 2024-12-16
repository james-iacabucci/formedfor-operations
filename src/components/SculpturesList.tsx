import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureCard } from "./sculpture/SculptureCard";
import { Sculpture } from "@/types/sculpture";

interface SculpturesListProps {
  selectedTags: string[];
}

export function SculpturesList({ selectedTags }: SculpturesListProps) {
  const { data: sculptures, isLoading } = useQuery({
    queryKey: ["sculptures", selectedTags],
    queryFn: async () => {
      console.log("Fetching sculptures with selected tags:", selectedTags);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      let query = supabase
        .from("sculptures")
        .select(`
          *,
          sculpture_tags!inner (
            tag_id
          )
        `)
        .eq("user_id", user.user.id);

      if (selectedTags.length > 0) {
        query = query.in('sculpture_tags.tag_id', selectedTags);
      }

      const { data, error } = await query;
      if (error) throw error;

      console.log("Fetched sculptures:", data);
      return data as Sculpture[];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sculptures?.length) {
    return <div>No sculptures found</div>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sculptures.map((sculpture) => (
        <SculptureCard key={sculpture.id} sculpture={sculpture} />
      ))}
    </div>
  );
}