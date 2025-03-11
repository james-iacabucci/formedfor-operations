
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NewQuote } from "@/types/fabrication-quote-form";

interface NotesSectionProps {
  notes: string | null;
  onChange: (newNotes: string) => void;
}

export function NotesSection({ notes, onChange }: NotesSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
      <Textarea
        value={notes || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
      />
    </div>
  );
}
