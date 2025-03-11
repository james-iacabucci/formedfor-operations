
import { Button } from "@/components/ui/button";

interface SheetFooterActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SheetFooterActions({
  onCancel,
  onSave,
  isSaving
}: SheetFooterActionsProps) {
  return (
    <div className="flex justify-end gap-2 w-full">
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button 
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Apply"}
      </Button>
    </div>
  );
}
