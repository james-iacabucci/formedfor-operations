import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface TagEdit {
  id: string;
  name: string;
  originalName: string;
}

export function useTagsState() {
  const [editingTag, setEditingTag] = useState<TagEdit | null>(null);
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [pendingEdits, setPendingEdits] = useState<Map<string, string>>(new Map());
  const queryClient = useQueryClient();

  const startEditingTag = (tagId: string, currentName: string) => {
    setEditingTag({ id: tagId, name: currentName, originalName: currentName });
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    
    if (editingTag.name !== editingTag.originalName) {
      setPendingEdits(new Map(pendingEdits.set(editingTag.id, editingTag.name)));
    }
    setEditingTag(null);
  };

  const handleDeleteTag = (tagId: string) => {
    setPendingDeletes(new Set([...pendingDeletes, tagId]));
  };

  const undoDelete = (tagId: string) => {
    const newDeletes = new Set(pendingDeletes);
    newDeletes.delete(tagId);
    setPendingDeletes(newDeletes);
  };

  const undoEdit = (tagId: string) => {
    const newEdits = new Map(pendingEdits);
    newEdits.delete(tagId);
    setPendingEdits(newEdits);
  };

  const applyChanges = async () => {
    try {
      // Handle deletes
      for (const tagId of pendingDeletes) {
        const { error } = await supabase
          .from('tags')
          .delete()
          .eq('id', tagId);
        
        if (error) throw error;
      }

      // Handle edits
      for (const [tagId, newName] of pendingEdits) {
        const { error } = await supabase
          .from('tags')
          .update({ name: newName })
          .eq('id', tagId);
        
        if (error) throw error;
      }

      // Clear pending changes
      setPendingDeletes(new Set());
      setPendingEdits(new Map());
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['sculptures'] });
      
      toast({
        title: "Success",
        description: "Tag changes saved successfully.",
      });
    } catch (error) {
      console.error('Error applying tag changes:', error);
      toast({
        title: "Error",
        description: "Failed to save tag changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    editingTag,
    setEditingTag,
    pendingDeletes,
    pendingEdits,
    startEditingTag,
    handleUpdateTag,
    handleDeleteTag,
    undoDelete,
    undoEdit,
    applyChanges,
  };
}