import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Sculpture } from "@/types/sculpture";
import { Tag as TagIcon, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManageTagsDialogProps {
  sculpture: Sculpture | null;
  onOpenChange: (open: boolean) => void;
}

export function ManageTagsDialog({
  sculpture,
  onOpenChange,
}: ManageTagsDialogProps) {
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
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
    queryKey: ["sculpture_tags", sculpture?.id],
    enabled: !!sculpture,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sculpture_tags")
        .select("tag_id")
        .eq("sculpture_id", sculpture?.id);

      if (error) throw error;
      return data.map(st => st.tag_id);
    },
  });

  const addTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("sculpture_tags")
        .insert([{ sculpture_id: sculpture?.id, tag_id: tagId }]);

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
        .eq("sculpture_id", sculpture?.id)
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
      setNewTagName("");
      setIsCreatingTag(false);
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

  const handleCreateAndAdd = () => {
    if (!newTagName.trim()) return;
    createTagMutation.mutate(newTagName);
  };

  return (
    <Dialog open={sculpture !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isCreatingTag ? (
            <div className="space-y-2">
              <Input
                placeholder="New tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateAndAdd}>Create and Add</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingTag(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setIsCreatingTag(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Tag
            </Button>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">Current Tags</div>
            <div className="flex flex-wrap gap-2">
              {tags?.filter(tag => sculptureTags?.includes(tag.id)).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTagMutation.mutate(tag.id)}
                >
                  {tag.name}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Available Tags</div>
            <div className="flex flex-wrap gap-2">
              {tags?.filter(tag => !sculptureTags?.includes(tag.id)).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => addTagMutation.mutate(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}