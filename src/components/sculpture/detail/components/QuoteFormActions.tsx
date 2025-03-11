
import { Button } from "@/components/ui/button";

interface QuoteFormActionsProps {
  onSave?: () => void;
  onCancel?: () => void;
  isEditing: boolean;
}

export function QuoteFormActions({
  onSave,
  onCancel,
  isEditing
}: QuoteFormActionsProps) {
  if (!onSave || !onCancel) {
    return null;
  }
  
  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave}>
        {isEditing ? "Save Changes" : "Save Quote"}
      </Button>
    </div>
  );
}
