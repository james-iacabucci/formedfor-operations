
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NotesSectionProps {
  notes: string | null;
  onChange: (notes: string) => void;
  isReadOnly?: boolean;
  canOnlyEditMarkup?: boolean;
}

export function NotesSection({ 
  notes, 
  onChange, 
  isReadOnly = false,
  canOnlyEditMarkup = false
}: NotesSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-medium ${canOnlyEditMarkup ? "text-primary" : ""}`}>
        Notes
        {canOnlyEditMarkup && <span className="ml-1 text-xs">(Editable)</span>}
      </h3>
      <div>
        <Label htmlFor="quote_notes" className="sr-only">Notes</Label>
        {isReadOnly ? (
          <div className="min-h-[100px] p-3 rounded-md border border-input bg-background text-muted-foreground whitespace-pre-wrap">
            {notes || "No notes provided."}
          </div>
        ) : (
          <Textarea
            id="quote_notes"
            value={notes || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Add any additional notes about this quote..."
            className={`min-h-[100px] ${canOnlyEditMarkup ? "border-primary ring-1 ring-primary" : ""}`}
          />
        )}
      </div>
    </div>
  );
}
