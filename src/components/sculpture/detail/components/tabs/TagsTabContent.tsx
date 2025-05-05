
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/use-user-roles";
import { useTagsManagement } from "@/components/tags/useTagsManagement";
import { CreateTagForm } from "@/components/tags/CreateTagForm";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface TagsTabContentProps {
  sculptureId: string;
  tags: Array<{ id: string; name: string }>;
}

export function TagsTabContent({ sculptureId, tags }: TagsTabContentProps) {
  const [showTagForm, setShowTagForm] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const { toast } = useToast();
  const { hasPermission } = useUserRoles();
  const canManageTags = hasPermission('settings.manage_tags');

  // Use the tags management hook to handle tag operations
  const {
    tags: allTags,
    addTagMutation,
    removeTagMutation,
    createTagMutation
  } = useTagsManagement(sculptureId);

  // Filter out already assigned tags
  const availableTags = allTags?.filter(tag => 
    !tags.some(existingTag => existingTag.id === tag.id)
  ) || [];

  const handleAddTag = (tagId: string) => {
    if (!tagId) return;
    
    addTagMutation.mutate(tagId, {
      onSuccess: () => {
        setSelectedTagId("");
        toast({
          title: "Success",
          description: "Tag added successfully"
        });
      }
    });
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagMutation.mutate(tagId);
  };

  const handleCreateTag = (name: string) => {
    createTagMutation.mutate(name, {
      onSuccess: () => {
        setShowTagForm(false);
        toast({
          title: "Success",
          description: "Tag created and added successfully"
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {canManageTags && (
        <div className="flex flex-col space-y-3">
          {showTagForm ? (
            <CreateTagForm
              onCreateTag={handleCreateTag}
              onCancel={() => setShowTagForm(false)}
              isSubmitting={createTagMutation.isPending}
            />
          ) : (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an existing tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.length > 0 ? (
                      availableTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No available tags
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddTag(selectedTagId)}
                  disabled={!selectedTagId || addTagMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTagForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create New Tag
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        {tags.length > 0 ? (
          <div className="flex flex-col gap-2">
            {tags.map((tag) => (
              <div 
                key={tag.id} 
                className="bg-muted text-white px-3 py-2 rounded-md flex justify-between items-center"
              >
                <span>{tag.name}</span>
                {canManageTags && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                    onClick={() => handleRemoveTag(tag.id)}
                  >
                    <span className="sr-only">Remove</span>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tags assigned to this sculpture.</p>
        )}
      </div>
    </div>
  );
}
