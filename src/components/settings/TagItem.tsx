
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface TagItemProps {
  id: string;
  name: string;
  isEditing: boolean;
  editingName: string;
  onStartEdit: (tagId: string, currentName: string) => void;
  onSaveEdit: () => Promise<void>;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
  onDelete: (tagId: string) => void;
  isPendingEdit: boolean;
  onUndoEdit: (tagId: string) => void;
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
  onUndoEdit 
}: TagItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <span>{name}</span>
      <div className="flex items-center justify-end gap-1">
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
    </div>
  );
}
