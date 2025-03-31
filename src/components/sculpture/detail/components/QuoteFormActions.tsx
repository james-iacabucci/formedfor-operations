
import { Button } from "@/components/ui/button";

interface QuoteFormActionsProps {
  onSave?: () => void;
  onCancel?: () => void;
  isEditing: boolean;
  isReadOnly?: boolean;
  canOnlyEditMarkup?: boolean;
}

export function QuoteFormActions({ 
  onSave, 
  onCancel,
  isEditing,
  isReadOnly = false,
  canOnlyEditMarkup = false
}: QuoteFormActionsProps) {
  // Don't render any buttons if in read-only mode
  if (isReadOnly && !canOnlyEditMarkup) {
    return null;
  }
  
  return (
    <div className="flex justify-end space-x-2">
      {onCancel && (
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      
      {onSave && (
        <Button onClick={onSave}>
          {isEditing ? (canOnlyEditMarkup ? "Update Markup" : "Update") : "Save"}
        </Button>
      )}
    </div>
  );
}
