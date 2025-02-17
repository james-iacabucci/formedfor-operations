
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTagsManagement(sculptureId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", session.session.user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: sculptureTags } = useQuery({
    queryKey: ["sculpture_tags", sculptureId],
    enabled: !!sculptureId,
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("No authenticated user");
      }

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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("No authenticated user");
      }

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
      });
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("No authenticated user");
      }

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
      });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("tags")
        .insert([{ name, user_id: session.session.user.id }])
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
      toast({
        title: "Error",
        description: "Failed to create tag. Please try again.",
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
