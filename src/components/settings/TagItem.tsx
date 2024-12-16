import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";

interface TagItemProps {
  id: string;
  name: string;
  isEditing: boolean;
  editingName: string;
  onStartEdit: (id: string, name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
  onDelete: (id: string) => void;
  isPendingEdit: boolean;
  onUndoEdit: (id: string) => void;
}

export function TagItem({
  id,
  name,
  isEditing,
  editingName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onDelete,
  isPendingEdit,
  onUndoEdit,
}: TagItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-2 bg-card">
      {isEditing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={editingName}
            onChange={(e) => onEditChange(e.target.value)}
            className="h-8"
          />
          <Button onClick={onSaveEdit} size="sm" className="h-8">
            Save
          </Button>
          <Button
            variant="outline"
            onClick={onCancelEdit}
            size="sm"
            className="h-8"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm">
            {name}
            {isPendingEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUndoEdit(id)}
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
              onClick={() => onStartEdit(id, name)}
              className="h-7 w-7 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(id)}
              className="h-7 w-7 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}