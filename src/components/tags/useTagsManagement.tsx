import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useTagsManagement(sculptureId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

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
      toast({
        title: "Tag added",
        description: "The tag has been added to the sculpture.",
      });
    },
    onError: (error) => {
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Tag removed",
        description: "The tag has been removed from the sculpture.",
      });
    },
    onError: (error) => {
      console.error("Error removing tag:", error);
      toast({
        title: "Error",
        description: "Failed to remove tag. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("tags")
        .insert([{ name, user_id: user.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      addTagMutation.mutate(newTag.id);
    },
    onError: (error) => {
      console.error("Error creating tag:", error);
      toast({
        title: "Error",
        description: "Failed to create tag. Please try again.",
        variant: "destructive",
      });
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