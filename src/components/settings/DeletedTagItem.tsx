import { Button } from "@/components/ui/button";

interface DeletedTagItemProps {
  name: string;
  onUndo: () => void;
}

export function DeletedTagItem({ name, onUndo }: DeletedTagItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-2 bg-muted">
      <span className="flex-1 text-sm text-muted-foreground">
        {name} (Will be deleted)
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        className="h-7"
      >
        Undo
      </Button>
    </div>
  );
}