import { useTagsManagement } from "../tags/useTagsManagement";
import { useTagsState } from "./useTagsState";
import { TagItem } from "./TagItem";
import { DeletedTagItem } from "./DeletedTagItem";

export function ManageTagsSection() {
  const { tags } = useTagsManagement(undefined);
  const {
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
  } = useTagsState();

  return (
    <div className="space-y-3">
      {tags?.filter(tag => !pendingDeletes.has(tag.id)).map((tag) => (
        <TagItem
          key={tag.id}
          id={tag.id}
          name={pendingEdits.has(tag.id) ? pendingEdits.get(tag.id)! : tag.name}
          isEditing={editingTag?.id === tag.id}
          editingName={editingTag?.name || ""}
          onStartEdit={startEditingTag}
          onSaveEdit={handleUpdateTag}
          onCancelEdit={() => setEditingTag(null)}
          onEditChange={(value) => setEditingTag(editingTag ? { ...editingTag, name: value } : null)}
          onDelete={handleDeleteTag}
          isPendingEdit={pendingEdits.has(tag.id)}
          onUndoEdit={undoEdit}
        />
      ))}

      {Array.from(pendingDeletes).map(tagId => {
        const tag = tags?.find(t => t.id === tagId);
        if (!tag) return null;
        
        return (
          <DeletedTagItem
            key={tag.id}
            name={tag.name}
            onUndo={() => undoDelete(tag.id)}
          />
        );
      })}
    </div>
  );
}