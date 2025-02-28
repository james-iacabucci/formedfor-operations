
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export function useTagsManagement(sculptureId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: sculptureTags } = useQuery({
    queryKey: ["sculpture_tags", sculptureId],
    enabled: !!sculptureId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sculpture_tags")
        .select("tag_id")
        .eq("sculpture_id", sculptureId);

      if (error) throw error;
      return data.map(st => st.tag_id);
    },
  });

  const addTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("sculpture_tags")
        .insert([{ sculpture_id: sculptureId, tag_id: tagId }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sculpture_tags"] });
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      toast("Tag added successfully");
    },
    onError: (error) => {
      console.error("Error adding tag:", error);
      toast("Failed to add tag. Please try again.");
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("sculpture_tags")
        .delete()
        .eq("sculpture_id", sculptureId)
        .eq("tag_id", tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sculpture_tags"] });
      queryClient.invalidateQueries({ queryKey: ["sculptures"] });
      toast("Tag removed successfully");
    },
    onError: (error) => {
      console.error("Error removing tag:", error);
      toast("Failed to remove tag. Please try again.");
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) {
        throw new Error("You must be logged in to create tags");
      }
      
      const { data, error } = await supabase
        .from("tags")
        .insert([{ 
          name, 
          user_id: user.id // Still required by database schema
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      if (sculptureId) {
        addTagMutation.mutate(newTag.id);
      }
    },
    onError: (error) => {
      console.error("Error creating tag:", error);
      toast("Failed to create tag. Please try again.");
    },
  });

  return {
    tags,
    sculptureTags,
    addTagMutation,
    removeTagMutation,
    createTagMutation,
  };
}
