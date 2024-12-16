import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTagsManagement } from "../tags/useTagsManagement";
import { TagsList } from "../tags/TagsList";
import { CreateTagForm } from "../tags/CreateTagForm";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function ManageTagsSection() {
  const { tags, createTagMutation, removeTagMutation } = useTagsManagement(undefined);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");

  const handleCreateTag = (name: string) => {
    createTagMutation.mutate(name);
    setShowCreateForm(false);
  };

  const handleDeleteTag = (tagId: string) => {
    removeTagMutation.mutate(tagId);
  };

  const startEditingTag = (tagId: string, currentName: string) => {
    setEditingTagId(tagId);
    setEditingTagName(currentName);
  };

  const handleUpdateTag = async (tagId: string) => {
    // TODO: Implement tag update functionality
    toast({
      title: "Coming soon",
      description: "Tag updating will be available soon.",
    });
    setEditingTagId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Manage Tags</h4>
          <p className="text-sm text-muted-foreground">
            Create, edit, and delete tags to organize your sculptures
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)} 
          size="sm"
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      </div>

      {showCreateForm && (
        <div className="rounded-md border p-4 bg-muted/50">
          <CreateTagForm
            onCreateTag={handleCreateTag}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {tags?.map((tag) => (
          <div 
            key={tag.id} 
            className="flex items-center justify-between gap-2 rounded-lg border p-2 bg-card"
          >
            {editingTagId === tag.id ? (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                  className="h-8"
                />
                <Button onClick={() => handleUpdateTag(tag.id)} size="sm" className="h-8">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingTagId(null)}
                  size="sm"
                  className="h-8"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm">{tag.name}</span>
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
      </div>
    </div>
  );
}