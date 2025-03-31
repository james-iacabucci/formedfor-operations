
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
    <div className="space-y-2">
      <Label htmlFor="quote_notes" className={canOnlyEditMarkup ? "text-primary" : ""}>
        Notes
      </Label>
      <div>
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
