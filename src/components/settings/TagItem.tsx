
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface TagItemProps {
  id: string;
  name: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TagItem({ id, name, onEdit, onDelete }: TagItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <span>{name}</span>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(id)}
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
