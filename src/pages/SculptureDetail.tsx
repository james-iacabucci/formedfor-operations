import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SculptureDetailContent } from "@/components/sculpture/detail/SculptureDetailContent";
import { Sculpture, FileUpload } from "@/types/sculpture";

export default function SculptureDetail() {
  const { id } = useParams();

  const { data: sculpture, isLoading: isLoadingSculpture } = useQuery({
    queryKey: ["sculpture", id],
    queryFn: async () => {
      console.log("Fetching sculpture details:", id);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Transform and validate the data
      const validatedData: Sculpture = {
        ...data,
        models: Array.isArray(data.models) ? data.models as FileUpload[] : [],
        renderings: Array.isArray(data.renderings) ? data.renderings as FileUpload[] : [],
        dimensions: Array.isArray(data.dimensions) ? data.dimensions as FileUpload[] : [],
        status: data.status as "ideas" | "pending_additions" | "approved",
        ai_engine: data.ai_engine as "runware" | "manual",
        creativity_level: data.creativity_level as Sculpture["creativity_level"]
      };
      
      console.log("Fetched sculpture:", validatedData);
      return validatedData;
    },
  });

  const { data: originalSculpture } = useQuery({
    queryKey: ["sculpture", sculpture?.original_sculpture_id],
    enabled: !!sculpture?.original_sculpture_id,
    queryFn: async () => {
      console.log("Fetching original sculpture:", sculpture?.original_sculpture_id);
      const { data, error } = await supabase
        .from("sculptures")
        .select("*")
        .eq("id", sculpture.original_sculpture_id)
        .single();

      if (error) throw error;

      // Transform and validate the data
      const validatedData: Sculpture = {
        ...data,
        models: Array.isArray(data.models) ? data.models as FileUpload[] : [],
        renderings: Array.isArray(data.renderings) ? data.renderings as FileUpload[] : [],
        dimensions: Array.isArray(data.dimensions) ? data.dimensions as FileUpload[] : [],
        status: data.status as "ideas" | "pending_additions" | "approved",
        ai_engine: data.ai_engine as "runware" | "manual",
        creativity_level: data.creativity_level as Sculpture["creativity_level"]
      };
      
      console.log("Fetched original sculpture:", validatedData);
      return validatedData;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["sculpture_tags", id],
    enabled: !!id,
    queryFn: async () => {
      console.log("Fetching sculpture tags");
      const { data, error } = await supabase
        .from("sculpture_tags")
        .select(`
          tag_id,
          tags (
            id,
            name
          )
        `)
        .eq("sculpture_id", id);

      if (error) throw error;
      console.log("Fetched sculpture tags:", data);
      return data.map((st: any) => st.tags);
    },
  });

  if (isLoadingSculpture) {
    return <div>Loading...</div>;
  }

  if (!sculpture) {
    return <div>Sculpture not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        <SculptureDetailContent
          sculpture={sculpture}
          originalSculpture={originalSculpture}
          tags={tags || []}
        />
      </div>
    </div>
  );
}
