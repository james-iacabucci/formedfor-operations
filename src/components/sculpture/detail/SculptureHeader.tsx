
import { EditableField } from "./EditableField";
import { Sculpture } from "@/types/sculpture";

interface SculptureHeaderProps {
  sculpture: Sculpture;
}

export function SculptureHeader({ sculpture }: SculptureHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <EditableField
          value={sculpture.ai_generated_name || "Untitled Sculpture"}
          type="input"
          sculptureId={sculpture.id}
          field="ai_generated_name"
          className="text-4xl font-bold tracking-tight"
        />
      </div>

      <div>
        <EditableField
          value={sculpture.ai_description || "Sculpture description not defined"}
          type="textarea"
          sculptureId={sculpture.id}
          field="ai_description"
          className="text-muted-foreground italic"
        />
      </div>
    </div>
  );
}
