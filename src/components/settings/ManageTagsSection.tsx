import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTagsManagement } from "../tags/useTagsManagement";
import { TagsList } from "../tags/TagsList";
import { CreateTagForm } from "../tags/CreateTagForm";
import { toast } from "@/hooks/use-toast";

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
        <h3 className="text-lg font-medium">Manage Tags</h3>
        <Button onClick={() => setShowCreateForm(true)} size="sm">
          Add New Tag
        </Button>
      </div>

      {showCreateForm && (
        <CreateTagForm
          onCreateTag={handleCreateTag}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="space-y-4">
        {tags?.map((tag) => (
          <div key={tag.id} className="flex items-center justify-between gap-2">
            {editingTagId === tag.id ? (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                />
                <Button onClick={() => handleUpdateTag(tag.id)} size="sm">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingTagId(null)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1">{tag.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditingTag(tag.id, tag.name)}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    Delete
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