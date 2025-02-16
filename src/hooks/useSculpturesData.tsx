import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sculpture, FileUpload } from "@/types/sculpture";

export function useSculpturesData(selectedTags: string[]) {
  // Query to fetch sculptures
  const { data: sculptures, isLoading } = useQuery({
    queryKey: ["sculptures", selectedTags],
    queryFn: async () => {
      console.log("Fetching sculptures with selected tags:", selectedTags);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      let query = supabase.from("sculptures").select("*").eq("user_id", user.user.id);

      if (selectedTags.length > 0) {
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

      // Transform the data to match the Sculpture type
      const transformedData = data.map((item: any): Sculpture => ({
        ...item,
        models: Array.isArray(item.models) ? item.models as FileUpload[] : [],
        renderings: Array.isArray(item.renderings) ? item.renderings as FileUpload[] : [],
        dimensions: Array.isArray(item.dimensions) ? item.dimensions as FileUpload[] : [],
        status: item.status as "ideas" | "pending_additions" | "approved",
        ai_engine: item.ai_engine as "runware" | "manual",
        creativity_level: item.creativity_level as "none" | "small" | "medium" | "large" | null,
      }));

      console.log("Fetched sculptures:", transformedData);
      return transformedData;
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

  return {
    sculptures,
    isLoading,
    sculptureTagRelations,
    tags,
  };
}
