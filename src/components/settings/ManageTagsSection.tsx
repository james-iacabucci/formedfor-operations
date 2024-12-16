import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTagsManagement } from "../tags/useTagsManagement";
import { TagsList } from "../tags/TagsList";
import { CreateTagForm } from "../tags/CreateTagForm";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TagEdit {
  id: string;
  name: string;
  originalName: string;
}

export function ManageTagsSection() {
  const { tags } = useTagsManagement(undefined);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagEdit | null>(null);
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [pendingEdits, setPendingEdits] = useState<Map<string, string>>(new Map());
  const queryClient = useQueryClient();

  const startEditingTag = (tagId: string, currentName: string) => {
    setEditingTag({ id: tagId, name: currentName, originalName: currentName });
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    
    // Add to pending edits if name changed
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

  return (
    <div className="space-y-4">
      {showCreateForm && (
        <div className="rounded-md border p-4 bg-muted/50">
          <CreateTagForm
            onCreateTag={(name) => {
              setShowCreateForm(false);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {tags?.filter(tag => !pendingDeletes.has(tag.id)).map((tag) => (
          <div 
            key={tag.id} 
            className="flex items-center justify-between gap-2 rounded-lg border p-2 bg-card"
          >
            {editingTag?.id === tag.id ? (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  className="h-8"
                />
                <Button onClick={handleUpdateTag} size="sm" className="h-8">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingTag(null)}
                  size="sm"
                  className="h-8"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm">
                  {pendingEdits.has(tag.id) ? pendingEdits.get(tag.id) : tag.name}
                  {pendingEdits.has(tag.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => undoEdit(tag.id)}
                      className="ml-2 h-6 px-2 text-xs"
                    >
                      Undo
                    </Button>
                  )}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditingTag(tag.id, tag.name)}
                    className="h-7 w-7 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Show pending deletes with undo option */}
        {Array.from(pendingDeletes).map(tagId => {
          const tag = tags?.find(t => t.id === tagId);
          if (!tag) return null;
          
          return (
            <div 
              key={tag.id}
              className="flex items-center justify-between gap-2 rounded-lg border p-2 bg-muted"
            >
              <span className="flex-1 text-sm text-muted-foreground">
                {tag.name} (Will be deleted)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => undoDelete(tag.id)}
                className="h-7"
              >
                Undo
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}