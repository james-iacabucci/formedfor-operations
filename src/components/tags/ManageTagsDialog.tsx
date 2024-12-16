import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sculpture } from "@/types/sculpture";
import { CreateTagForm } from "./CreateTagForm";
import { TagsList } from "./TagsList";
import { useTagsManagement } from "./useTagsManagement";

interface ManageTagsDialogProps {
  sculpture: Sculpture | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTagsDialog({
  sculpture,
  open,
  onOpenChange,
}: ManageTagsDialogProps) {
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const { 
    tags, 
    sculptureTags, 
    addTagMutation, 
    removeTagMutation, 
    createTagMutation 
  } = useTagsManagement(sculpture?.id);

  const handleCreateTag = (name: string) => {
    createTagMutation.mutate(name);
    setIsCreatingTag(false);
  };

  const currentTags = tags?.filter(tag => sculptureTags?.includes(tag.id)) || [];
  const availableTags = tags?.filter(tag => !sculptureTags?.includes(tag.id)) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isCreatingTag ? (
            <CreateTagForm
              onCreateTag={handleCreateTag}
              onCancel={() => setIsCreatingTag(false)}
            />
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

          <TagsList
            title="Current Tags"
            tags={currentTags}
            variant="secondary"
            onTagClick={(tagId) => removeTagMutation.mutate(tagId)}
            showRemoveIcon
          />

          <TagsList
            title="Available Tags"
            tags={availableTags}
            variant="outline"
            onTagClick={(tagId) => addTagMutation.mutate(tagId)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}