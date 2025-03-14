
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TagEdit {
  id: string;
  name: string;
  originalName: string;
}

export function useTagsState() {
  const [editingTag, setEditingTag] = useState<TagEdit | null>(null);
  const [savingTagId, setSavingTagId] = useState<string | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const startEditingTag = (tagId: string, currentName: string) => {
    setEditingTag({ id: tagId, name: currentName, originalName: currentName });
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    
    // Only proceed with update if the name has changed
    if (editingTag.name === editingTag.originalName) {
      setEditingTag(null);
      return;
    }
    
    try {
      console.log("Updating tag:", editingTag.id, "with new name:", editingTag.name);
      setSavingTagId(editingTag.id);
      
      const { error } = await supabase
        .from('tags')
        .update({ name: editingTag.name })
        .eq('id', editingTag.id);
      
      if (error) throw error;
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      await queryClient.invalidateQueries({ queryKey: ['sculptures'] });
      
      toast.success("Tag updated successfully");
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error("Failed to update tag. Please try again.");
    } finally {
      setSavingTagId(null);
      setEditingTag(null);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      setDeletingTagId(tagId);
      
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      await queryClient.invalidateQueries({ queryKey: ['sculptures'] });
      
      toast.success("Tag deleted successfully");
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error("Failed to delete tag. Please try again.");
    } finally {
      setDeletingTagId(null);
    }
  };

  return {
    editingTag,
    setEditingTag,
    savingTagId,
    deletingTagId,
    startEditingTag,
    handleUpdateTag,
    handleDeleteTag,
  };
}
